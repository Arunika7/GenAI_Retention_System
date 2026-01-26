from ml.features import prepare_features
from ml.churn_rules import (
    calculate_churn_probability,
    get_risk_level,
    get_confidence_score,
    generate_recommendations
)

def predict_churn(customer_features: dict) -> dict:
    """
    Orchestrate the churn prediction process.
    
    Args:
        customer_features: Dictionary containing raw customer features.
        
    Returns:
        dict: Dictionary containing prediction results:
            - churn_probability
            - churn_risk
            - confidence_score
            - recommendations
    """
    # 1. Prepare and normalize features
    processed_features = prepare_features(customer_features)
    
    # 2. Calculate churn probability
    churn_prob = calculate_churn_probability(processed_features)
    
    # 3. Determine risk level
    risk_level = get_risk_level(churn_prob)
    
    # 4. Calculate confidence score
    confidence = get_confidence_score(churn_prob)
    
    # 5. Generate recommendations
    recommendations = generate_recommendations(processed_features, risk_level)
    
    return {
        "churn_probability": churn_prob,
        "churn_risk": risk_level,
        "confidence_score": confidence,
        "recommendations": recommendations
    }
