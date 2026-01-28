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
    OutreachResponse
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
                
                # Simple rule-based logic for consistent probability scoring (Baseline)
                # We keep this to ensure the risk *level* is mathematically grounded
                
                discount_score = 0.3 if features.discount_sensitivity.lower() in ["high", "very high"] else 0.0
                online_score = 0.1 if features.online_ratio > 0.7 else 0.0
                
                churn_probability = (
                    (normalized_days_since_last * 0.5) + 
                    ((1 - normalized_purchase_count) * 0.3) +
                    discount_score + online_score
                )
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
                # We pass the calculated metrics to the LLM to get the "Why" and "What Next"
                explanation_data = explanation_engine.generate_explanation(
                    features.dict(),
                    churn_probability,
                    risk_level
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

@router.get("/health")
async def health_check():
    """
    Health check endpoint for FreshMart churn prediction service.
    """
    return {"status": "healthy", "service": "freshmart_churn_prediction"}