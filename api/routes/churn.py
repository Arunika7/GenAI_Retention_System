from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging
import pandas as pd
from opentelemetry import trace
from api.schemas import (
    CustomerFeatures, 
    CustomerProfile, 
    ChurnPredictionResponse as ChurnPrediction,
    SimulationInput,
    SimulationResponse,
    OutreachRequest,
    OutreachResponse,
    ComparisonResult,
    InterventionConfig,
    ComparisonRequest,
    InterventionResult
)
from genai.explanation_engine import GenAIExplanationEngine

logger = logging.getLogger(__name__)
router = APIRouter()
tracer = trace.get_tracer(__name__)

# Initialize GenAI Engine
explanation_engine = GenAIExplanationEngine()

# Load customer data
try:
    CUSTOMER_DF = pd.read_csv("data/freshmart_customers_big.csv")
    CUSTOMER_DF["customer_id"] = CUSTOMER_DF["customer_id"].astype(str)
    CUSTOMER_DF.set_index("customer_id", inplace=True)
    logger.info(f"Loaded {len(CUSTOMER_DF)} customer records.")
except Exception as e:
    logger.error(f"Failed to load customer data: {e}")
    CUSTOMER_DF = pd.DataFrame()

# Load competitor data
try:
    COMPETITOR_DF = pd.read_csv("data/competitor_prices.csv")
    logger.info(f"Loaded {len(COMPETITOR_DF)} competitor price records.")
except Exception as e:
    logger.error(f"Failed to load competitor data: {e}")
    COMPETITOR_DF = pd.DataFrame()

def get_competitor_gap(category: str, freshmart_price: float = None):
    """
    Finds the largest price gap for a given category.
    Returns (gap_percentage, competitor_name, competitor_price)
    """
    if COMPETITOR_DF.empty:
        return 0.0, None, 0.0
    
    # Filter for the category
    cat_prices = COMPETITOR_DF[COMPETITOR_DF['category'] == category]
    if cat_prices.empty:
        return 0.0, None, 0.0
    
    # Get FreshMart price from our data if not provided (assuming it's in the CSV)
    # The CSV structure is: category, freshmart_avg_price, competitor_name, competitor_price
    # We take the first row's freshmart price as reference if multiple competitors exist
    if freshmart_price is None:
        freshmart_price = cat_prices.iloc[0]['freshmart_avg_price']
    
    # Find lowest competitor price
    min_comp_row = cat_prices.loc[cat_prices['competitor_price'].idxmin()]
    min_price = min_comp_row['competitor_price']
    competitor_name = min_comp_row['competitor_name']
    
    if freshmart_price <= 0:
        return 0.0, None, 0.0

    gap = (freshmart_price - min_price) / freshmart_price
    return gap, competitor_name, min_price

@router.get("/customer/{customer_id}", response_model=CustomerProfile)
async def get_customer(customer_id: str):
    """
    Fetch customer profile by ID from the simulated database.
    """
    if customer_id not in CUSTOMER_DF.index:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    data = CUSTOMER_DF.loc[customer_id].to_dict()
    data["customer_id"] = customer_id
    return data

@router.post("/predict", response_model=ChurnPrediction)
async def predict_churn(features: CustomerFeatures):
    """
    Predict churn risk for a FreshMart customer based on their shopping behavior,
    enriched with GenAI explanations.
    """
    with tracer.start_as_current_span("predict_churn") as span:
        span.set_attribute("customer_id", features.customer_id)
        
        try:
            with tracer.start_as_current_span("preprocessing"):
                # Normalize input values
                normalized_purchase_count = min(features.yearly_purchase_count / 52, 1.0)  # Weekly purchases
                normalized_days_since_last = min(features.days_since_last_purchase / 90, 1.0)  # 3 months
                # ... other normalizations used for calculation ...
                
                # Simple rule-based logic for consistent probability scoring (Baseline)
                # We keep this to ensure the risk *level* is mathematically grounded
                
                discount_score = 0.3 if features.discount_sensitivity.lower() in ["high", "very high"] else 0.0
                online_score = 0.1 if features.online_ratio > 0.7 else 0.0
                
                churn_probability = (
                    (normalized_days_since_last * 0.5) + 
                    ((1 - normalized_purchase_count) * 0.3) +
                    discount_score + online_score
                )

                
                # --- Competitor Price Gap Analysis ---
                gap_pct, comp_name, comp_price = get_competitor_gap(features.primary_category)
                competitor_risk_factor = False
                
                if gap_pct > 0.10: # If competitor is > 10% cheaper
                    churn_probability += 0.15
                    competitor_risk_factor = True
                    span.set_attribute("competitor_risk", True)
                    span.set_attribute("competitor_gap", gap_pct)
                
                churn_probability = min(max(churn_probability, 0.0), 0.99)
                
                span.set_attribute("churn_probability", float(churn_probability))
            
            with tracer.start_as_current_span("response_generation"):
                # Determine risk level
                if churn_probability >= 0.7:
                    risk_level = "High"
                    confidence = 0.85
                elif churn_probability >= 0.4:
                    risk_level = "Medium"
                    confidence = 0.75
                else:
                    risk_level = "Low"
                    confidence = 0.80
                
                span.set_attribute("churn_risk", risk_level)


                # --- GenAI Integration ---
                # Prepare explanation data context
                explanation_context = {
                    "competitor_data": {
                        "has_risk": competitor_risk_factor,
                        "competitor_name": comp_name,
                        "competitor_price": comp_price,
                        "gap_pct": gap_pct
                    } if competitor_risk_factor else None
                }
                
                # We pass the calculated metrics to the LLM to get the "Why" and "What Next"
                explanation_data = explanation_engine.generate_explanation(
                    features.dict(),
                    churn_probability,
                    risk_level,
                    explanation_context
                )
                
                explanation_summary = explanation_data.get("summary")
                key_factors = explanation_data.get("key_factors", [])
                recommendations = explanation_data.get("recommended_actions", [])
                
                # Fallback if LLM returns empty list for chunks
                if not recommendations:
                     recommendations = ["Review customer engagement history manually."]

                prediction = ChurnPrediction(
                    customer_id=features.customer_id,
                    churn_probability=float(churn_probability),
                    churn_risk=risk_level,
                    confidence_score=confidence,
                    recommendations=recommendations,
                    explanation_summary=explanation_summary,
                    key_factors=key_factors
                )
            
            logger.info(f"Churn prediction completed for {features.customer_id}: {risk_level} risk")
            return prediction
            
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
            logger.error(f"Error in churn prediction: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Churn prediction failed: {str(e)}")

@router.post("/simulate", response_model=SimulationResponse)
async def simulate_intervention(simulation: SimulationInput):
    """
    Simulate the impact of a retention high-touch intervention on churn probability.
    """
    if simulation.customer_id not in CUSTOMER_DF.index:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    features = CUSTOMER_DF.loc[simulation.customer_id].to_dict()
    
    # 1. Calculate Original Probability (Baseline)
    # Using the same logic as /predict
    days_since = min(features['days_since_last_purchase'] / 90, 1.0)
    purchase_vol = min(features['yearly_purchase_count'] / 52, 1.0)
    
    # Baseline prob (without discount sensitivity added yet)
    baseline_prob = (days_since * 0.5) + ((1 - purchase_vol) * 0.3)
    
    # 2. Calculate "New" Probability based on Intervention
    # Discount impact: Reduction of up to 40% of baseline risk
    discount_impact = (simulation.planned_discount / 100) * 0.4
    
    # Points impact: Reduction of up to 10%
    points_impact = min(simulation.loyalty_points_bonus / 1000, 1.0) * 0.1
    
    new_prob = baseline_prob - discount_impact - points_impact
    new_prob = min(max(new_prob, 0.01), 0.99)
    
    improvement = baseline_prob - new_prob
    
    if improvement > 0.3:
        level = "High Impact"
        desc = "This intervention significantly stabilizes the customer."
    elif improvement > 0.1:
        level = "Moderate Impact"
        desc = "The intervention helps, but may need further personalization."
    else:
        level = "Low Impact"
        desc = "Minimal impact. Consider a more aggressive discount or direct outreach."

    return SimulationResponse(
        original_probability=baseline_prob,
        new_probability=new_prob,
        impact_description=desc,
        risk_reduction_level=level
    )

@router.post("/generate-outreach", response_model=OutreachResponse)
async def generate_outreach(request: OutreachRequest):
    """
    Generate a personalized retention message for a customer.
    """
    if request.customer_id not in CUSTOMER_DF.index:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    features = CUSTOMER_DF.loc[request.customer_id].to_dict()
    features["customer_id"] = request.customer_id
    
    try:
        outreach = explanation_engine.generate_outreach_draft(
            features,
            {"type": request.intervention_type, "details": request.intervention_details}
        )
        return OutreachResponse(**outreach)
    except Exception as e:
        logger.error(f"Failed to generate outreach: {e}")
        raise HTTPException(status_code=500, detail="GenAI outreach generation failed.")

@router.get("/top-risk")
async def get_top_risk_customers():
    """
    Retrieve the top 100 at-risk customers from the batch job results.
    """
    import sqlite3
    import json
    
    DB_PATH = "data/churn.db"
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM at_risk_customers ORDER BY churn_probability DESC LIMIT 100")
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            # Parse JSON fields
            try:
                factors = json.loads(row['factors'])
            except:
                factors = []
                
            try:
                recommendations = json.loads(row['recommendations'])
            except:
                recommendations = []
                
            results.append({
                "customer_id": row['customer_id'],
                "churn_probability": row['churn_probability'],
                "churn_risk": row['churn_risk'],
                "key_factors": factors,
                "recommendations": recommendations
            })
            
        conn.close()
        return results
        
    except Exception as e:
        logger.error(f"Failed to fetch top risk customers: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve data: {str(e)}")

@router.post("/simulate-comparison", response_model=ComparisonResult)
async def simulate_comparison(request: ComparisonRequest):
    """
    Compare two intervention strategies side-by-side and determine a winner
    based on Net Retention Score.
    """
    
    if request.customer_id not in CUSTOMER_DF.index:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    features = CUSTOMER_DF.loc[request.customer_id].to_dict()
    
    # 1. Calculate Baseline
    days_since = min(features.get('days_since_last_purchase', 30) / 90, 1.0)
    purchase_vol = min(features.get('yearly_purchase_count', 12) / 52, 1.0)
    
    baseline_prob = (days_since * 0.5) + ((1 - purchase_vol) * 0.3)
    baseline_prob = min(max(baseline_prob, 0.01), 0.99)
    
    avg_order_value = features.get('avg_order_value', 50.0)
    annual_value = avg_order_value * features.get('yearly_purchase_count', 12) # Rough LTV proxy
    
    def calculate_impact(strategy: InterventionConfig):
        # Calculate impact similar to simulate endpoint
        discount_impact = (strategy.planned_discount / 100) * 0.4
        points_impact = min(strategy.loyalty_points_bonus / 1000, 1.0) * 0.1
        
        new_prob = baseline_prob - discount_impact - points_impact
        new_prob = min(max(new_prob, 0.01), 0.99)
        
        reduction = baseline_prob - new_prob
        
        # Calculate Cost
        # Discount cost = discount % of ONE order * probability they stay? 
        # For simplicity in this v1: cost = discount % of average order value
        cost_discount = (strategy.planned_discount / 100) * avg_order_value
        cost_points = strategy.loyalty_points_bonus * 0.01 # $0.01 per point
        total_cost = cost_discount + cost_points
        
        # Calculate Net Score
        # Value Saved = Reduction in Churn * Annual Value
        value_saved = reduction * annual_value
        net_score = value_saved - total_cost
        
        return InterventionResult(
            name=strategy.name,
            new_churn_probability=new_prob,
            churn_reduction_absolute=reduction,
            intervention_cost=total_cost,
            net_retention_score=net_score
        )

    result_a = calculate_impact(request.strategy_a)
    result_b = calculate_impact(request.strategy_b)
    
    winner = result_a.name if result_a.net_retention_score > result_b.net_retention_score else result_b.name
    
    return ComparisonResult(
        customer_id=request.customer_id,
        baseline_churn_probability=baseline_prob,
        strategy_a=result_a,
        strategy_b=result_b,
        winner=winner
    )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for FreshMart churn prediction service.
    """
    return {"status": "healthy", "service": "freshmart_churn_prediction"}