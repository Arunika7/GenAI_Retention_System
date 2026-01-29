from pydantic import BaseModel, Field
from typing import List, Optional

class CustomerFeatures(BaseModel):
    """
    Schema representing customer features for churn prediction.
    """
    customer_id: str = Field(..., description="Unique identifier for the customer")
    primary_category: str = Field(..., description="Primary shopping category")
    yearly_purchase_count: int = Field(..., description="Total number of purchases in the last year")
    avg_gap_days: int = Field(..., description="Average days between purchases")
    avg_order_value: float = Field(..., description="Average value of orders")
    days_since_last_purchase: int = Field(..., description="Days elapsed since the last purchase")
    discount_sensitivity: str = Field(..., description="Level of sensitivity to discounts (e.g., Low, Medium, High)")
    online_ratio: float = Field(..., description="Ratio of online purchases to total purchases (0.0 to 1.0)")

class CustomerProfile(CustomerFeatures):
    """
    Full customer profile including demographics and behavioral features.
    """
    age: int = Field(..., description="Customer age")
    gender: str = Field(..., description="Customer gender")
    location: str = Field(..., description="Customer location")
    tenure_months: int = Field(..., description="Months since customer joined")

class ChurnPredictionResponse(BaseModel):
    """
    Schema representing the churn prediction output.
    """
    customer_id: str = Field(..., description="Unique identifier for the customer")
    churn_probability: float = Field(..., description="Estimated probability of churn (0.0 to 1.0)")
    churn_risk: str = Field(..., description="Categorical risk level (Low, Medium, High)")
    confidence_score: float = Field(..., description="Confidence score of the prediction (0.0 to 1.0)")
    recommendations: List[str] = Field(..., description="List of actionable retention recommendations")
    explanation_summary: Optional[str] = Field(None, description="GenAI generated textual explanation of the risk")
    key_factors: Optional[List[str]] = Field(None, description="Key factors contributing to the risk")

class SimulationInput(BaseModel):
    """
    Schema for simulating the impact of interventions on churn risk.
    """
    customer_id: str
    planned_discount: float = Field(default=0.0, description="Hypothetical discount percentage (0-100)")
    loyalty_points_bonus: int = Field(default=0, description="Hypothetical extra loyalty points")
    intervention_channel: str = Field(default="email", description="Chosen channel for intervention")

class SimulationResponse(BaseModel):
    """
    Schema for simulation results.
    """
    original_probability: float
    new_probability: float
    impact_description: str
    risk_reduction_level: str

class OutreachRequest(BaseModel):
    """
    Schema for requesting a personalized outreach draft.
    """
    customer_id: str
    intervention_type: str = Field(..., description="e.g., 'Discount', 'Loyalty Gift', 'Personal Check-in'")
    intervention_details: str = Field(..., description="Specific details like '20% off' or '500 bonus points'")

class OutreachResponse(BaseModel):
    """
    Schema for the generated outreach content.
    """
    subject_line: str
    message_body: str
    channel_optimized: str

class InterventionConfig(BaseModel):
    """
    Configuration for a single intervention strategy in a comparison.
    """
    name: str = Field(..., description="Name of the strategy (e.g. 'Aggressive Discount')")
    planned_discount: float = Field(default=0.0, description="Discount percentage (0-100)")
    loyalty_points_bonus: int = Field(default=0, description="Loyalty points to add")

class InterventionResult(BaseModel):
    """
    Result of a single intervention simulation.
    """
    name: str
    new_churn_probability: float
    churn_reduction_absolute: float
    intervention_cost: float
    net_retention_score: float

class ComparisonResult(BaseModel):
    """
    Response schema for the A/B comparison.
    """
    customer_id: str
    baseline_churn_probability: float
    strategy_a: InterventionResult
    strategy_b: InterventionResult
    winner: str = Field(..., description="Name of the winning strategy")

class ComparisonRequest(BaseModel):
    """
    Request schema for running an A/B test.
    """
    customer_id: str
    strategy_a: InterventionConfig
    strategy_b: InterventionConfig
