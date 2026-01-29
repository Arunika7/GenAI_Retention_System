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
    with open("debug_status.txt", "w") as f:
        f.write(f"SUCCESS: Loaded {len(CUSTOMER_DF)} customers.\nSample ID: {CUSTOMER_DF.index[0]}")
except Exception as e:
    logger.error(f"Failed to load customer data: {e}")
    with open("debug_status.txt", "w") as f:
        f.write(f"ERROR: Failed to load customer data: {e}")
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

@router.get("/customers")
async def get_all_customers(skip: int = 0, limit: int = 100):
    """
    Fetch all customers with pagination support.
    """
    try:
        # Get total count
        total = len(CUSTOMER_DF)
        
        # Get paginated data
        customers = []
        for idx, (customer_id, row) in enumerate(CUSTOMER_DF.iterrows()):
            if idx < skip:
                continue
            if idx >= skip + limit:
                break
            
            customer_data = row.to_dict()
            customer_data["customer_id"] = customer_id
            customers.append(customer_data)
        
        return {
            "customers": customers,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Failed to fetch customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
                
                # --- Real ML Inference ---
                from ml.inference import churn_model_service
                
                # Prepare features for the model (ensure keys match what model expects)
                model_input = {
                    "days_since_last_purchase": features.days_since_last_purchase,
                    "yearly_purchase_count": features.yearly_purchase_count,
                    "avg_gap_days": features.avg_gap_days,
                    "discount_sensitivity": features.discount_sensitivity,
                    "online_ratio": features.online_ratio,
                    "primary_category": features.primary_category,
                    "avg_order_value": features.avg_order_value
                }
                
                churn_probability = churn_model_service.predict_churn_probability(model_input)
                churn_probability = min(max(churn_probability, 0.0), 0.99)
                
                span.set_attribute("churn_probability", float(churn_probability))
                span.set_attribute("model_used", "random_forest_v1")

                
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
                # --- SHAP Explanation (The "Why") ---
                from ml.explain import explain_churn_decision
                shap_explanation = explain_churn_decision(model_input, churn_probability)
                
                # --- GenAI Integration (The Narrative) ---
                # Prepare explanation data context
                explanation_context = {
                    "competitor_data": {
                        "has_risk": competitor_risk_factor,
                        "competitor_name": comp_name,
                        "competitor_price": comp_price,
                        "gap_pct": gap_pct
                    } if competitor_risk_factor else None,
                    "shap_data": shap_explanation  # Pass mathematical "Why" to the LLM
                }
                
                # We pass the calculated metrics to the LLM to get the "Why" and "What Next"
                explanation_data = explanation_engine.generate_explanation(
                    features.dict(),
                    churn_probability,
                    risk_level,
                    explanation_context
                )
                
                explanation_summary = explanation_data.get("summary")
                # Merge SHAP factors if LLM fails or for data richness
                key_factors = explanation_data.get("key_factors", [])
                if not key_factors and shap_explanation.get("top_churn_driver"):
                     key_factors = [shap_explanation["explanation"]]

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

@router.get("/analytics")
async def get_analytics():
    """
    Get analytics data for the dashboard including risk distribution,
    average churn probability, and total customers.
    """
    try:
        if CUSTOMER_DF.empty:
            raise HTTPException(status_code=503, detail="Customer data not available")
        
        from ml.inference import churn_model_service
        
        # Performance: Sample 2000 customers for dashboard speed (Real-time inference is heavy)
        # In production, this would be a pre-calculated materialized view.
        sample_size = min(2000, len(CUSTOMER_DF))
        sample_df = CUSTOMER_DF.sample(n=sample_size, random_state=42)
        
        risk_counts = {"Low": 0, "Medium": 0, "High": 0}
        total_probability = 0
        total_revenue = 0
        
        for customer_id, row in sample_df.iterrows():
            customer_data = row.to_dict()
            # Prepare format for model match
            model_input = {
                "days_since_last_purchase": customer_data.get("days_since_last_purchase", 0),
                "yearly_purchase_count": customer_data.get("yearly_purchase_count", 0),
                "avg_gap_days": customer_data.get("avg_gap_days", 0),
                "discount_sensitivity": customer_data.get("discount_sensitivity", "Medium"),
                "online_ratio": customer_data.get("online_ratio", 0),
                "avg_order_value": customer_data.get("avg_order_value", 0)
            }
            
            try:
                churn_prob = churn_model_service.predict_churn_probability(model_input)
                
                if churn_prob >= 0.7:
                    r_level = "High"
                elif churn_prob >= 0.4:
                    r_level = "Medium"
                else:
                    r_level = "Low"
                
                risk_counts[r_level] += 1
                total_probability += churn_prob
                
                est_revenue = customer_data.get("avg_order_value", 0) * customer_data.get("yearly_purchase_count", 0)
                total_revenue += est_revenue
                
            except Exception:
                continue
        
        # Scale up to full dataset estimate
        scale_factor = len(CUSTOMER_DF) / sample_size if sample_size > 0 else 1
        
        # Calculate averge churn from the accumulated probability
        avg_churn = total_probability / sample_size if sample_size > 0 else 0
        
        # Project total revenue
        total_revenue_projected = total_revenue * scale_factor

        # Return metrics matching the frontend 'Analytics.jsx' expectations
        return {
            "total_customers": len(CUSTOMER_DF),
            "avg_churn_rate": round(avg_churn, 4),
            "high_risk_count": int(risk_counts["High"] * scale_factor),
            "medium_risk_count": int(risk_counts["Medium"] * scale_factor),
            "low_risk_count": int(risk_counts["Low"] * scale_factor),
            "total_revenue_est": round(total_revenue_projected, 2),
            "risk_distribution": {
                "High": int(risk_counts["High"] * scale_factor),
                "Medium": int(risk_counts["Medium"] * scale_factor),
                "Low": int(risk_counts["Low"] * scale_factor)
            }
        }
        
    except Exception as e:
        logger.error(f"Analytics generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate analytics: {str(e)}")

@router.get("/top-risk")
async def get_top_risk_customers():
    """
    Retrieve the top 100 at-risk customers from the batch job results.
    """
    import sqlite3
    import json
    import os
    
    db_path = "data/db/churn.db"
    if not os.path.exists(db_path):
        # Fallback to empty if DB not found (though it should exist)
        return []

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get top 100 high-risk customers
        query = """
        SELECT customer_id, risk_score, churn_probability, top_factors 
        FROM churn_predictions 
        ORDER BY churn_probability DESC 
        LIMIT 100
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            results.append({
                "customer_id": row[0],
                "churn_risk": "High" if row[2] > 0.7 else "Medium",
                "churn_probability": row[2],
                "key_factors": json.loads(row[3]) if row[3] else [],
                "recommendations": [] # Placeholder for now as top_risk query doesn't join recommend yet
            })
            
        conn.close()
        return results
        
    except Exception as e:
        logger.error(f"Failed to fetch top risk customers: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve data: {str(e)}")

@router.get("/customers")
async def get_customers(page: int = 1, limit: int = 100, search: str = ""):
    """
    Get paginated customer list with optional search.
    """
    try:
        # Filter logic
        logger.info(f"🔍 Searching customers with query: '{search}' | DF Size: {len(CUSTOMER_DF)}")
        
        if search:
            search_clean = search.strip()
            # Try exact match first (fastest)
            if search_clean in CUSTOMER_DF.index:
                filtered_df = CUSTOMER_DF.loc[[search_clean]]
                logger.info(f"🔍 Found exact match for '{search_clean}'")
            else:
                # Fallback to substring search
                # Ensure index is treated as string and handle NaNs
                mask = CUSTOMER_DF.index.astype(str).str.contains(search_clean, case=False, regex=False, na=False)
                filtered_df = CUSTOMER_DF[mask]
                logger.info(f"🔍 Found {len(filtered_df)} matches for '{search_clean}'")
        else:
            filtered_df = CUSTOMER_DF
            
        total_count = len(filtered_df)
        logger.info(f"🔍 Final Total Count: {total_count}")
        
        # Pagination logic
        start = (page - 1) * limit
        end = start + limit
        
        # Slice the dataframe
        paginated_df = filtered_df.iloc[start:end]
        
        results = []
        for customer_id, row in paginated_df.iterrows():
            # Basic info
            results.append({
                "id": customer_id,
                "name": f"Customer {customer_id.split('_')[-1]}", # Mock name
                "category": str(row.get("primary_category", "Unknown")), # Ensure string
                "spend": float(row.get("avg_order_value", 0)) * float(row.get("yearly_purchase_count", 0)),
                "risk": "High" if row.get("days_since_last_purchase", 0) > 60 else "Low" # Simple heuristic for list view speed
            })
            
        return {
            "data": results,
            "total": total_count,
            "page": page,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Customer list fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer/{customer_id}")
async def get_customer_details(customer_id: str):
    """
    Get raw features for a specific customer to populate the ChurnForm.
    """
    if customer_id not in CUSTOMER_DF.index:
         raise HTTPException(status_code=404, detail="Customer not found")
         
    try:
        # Return the raw features as a dictionary
        row = CUSTOMER_DF.loc[customer_id]
        data = row.to_dict()
        data["customer_id"] = customer_id
        
        # Ensure correct types for JSON
        for k, v in data.items():
            if hasattr(v, 'item'): # numpy types
                 data[k] = v.item()
                 
        # Fill missing relevant fields for form if needed
        return data
    except Exception as e:
        logger.error(f"Failed to fetch customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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