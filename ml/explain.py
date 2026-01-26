def explain_churn_decision(customer_features: dict, churn_probability: float) -> list:
    """
    Generate human-readable explanations for the churn prediction.
    
    Args:
        customer_features (dict): Dictionary of normalized/processed customer features.
        churn_probability (float): The calculated probability of churn (0.0 to 1.0).
        
    Returns:
        list[str]: List of reasons explaining the churn risk.
    """
    reasons = []
    
    # If churn probability is low, we might not need extensive explanations, 
    # but we can still highlight positive factors or minor risks.
    # Here we focus on why it might be high.
    
    # 1. Recency Analysis
    days_since_last = customer_features.get("days_since_last_purchase", 0)
    # Note: These thresholds should match the logic in features.py/churn_rules.py qualitatively
    if days_since_last > 60:
        reasons.append(f"Long gap since last purchase ({int(days_since_last)} days)")
    elif days_since_last > 30:
        reasons.append("Recent engagement has dropped")

    # 2. Purchase Frequency
    avg_gap = customer_features.get("avg_gap_days", 0)
    if avg_gap > 21: # > 3 weeks
        reasons.append("Infrequent purchase pattern")
    
    count = customer_features.get("yearly_purchase_count", 0)
    if count < 6:
        reasons.append("Very low yearly purchase volume")
        
    # 3. Discount Sensitivity
    sensitivity = str(customer_features.get("discount_sensitivity", "")).lower()
    if sensitivity in ["high", "very high"]:
        reasons.append("High sensitivity to discounts increases churn risk if no deals available")
        
    # 4. Category Risk
    category = str(customer_features.get("primary_category", "")).lower()
    if category in ["household", "electronics", "fashion"]:
        reasons.append(f"Category '{category.title()}' typically has higher churn rates")
        
    # 5. Online Ratio
    online_ratio = float(customer_features.get("online_ratio", 0.0))
    if online_ratio > 0.8:
        reasons.append("High dependence on online channel may indicate lower brand loyalty")
        
    # If risk is high but no specific feature triggered (edge case), add generic
    if churn_probability > 0.6 and not reasons:
        reasons.append("Combination of behavioral factors indicates high risk")
        
    return reasons
