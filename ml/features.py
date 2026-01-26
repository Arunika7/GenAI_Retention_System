def prepare_features(raw_features: dict) -> dict:
    """
    Preprocess and normalize customer features for churn prediction.
    
    Args:
        raw_features: Dictionary containing raw customer features.
        
    Returns:
        dict: Dictionary containing processed features.
    """
    features = raw_features.copy()
    
    # 1. Normalize numeric values with caps
    # Days since last purchase (cap at 90 days)
    days_since_last = features.get("days_since_last_purchase", 0)
    features["days_since_last_purchase"] = min(days_since_last, 90)
    
    # Average gap days (cap at 30 days)
    avg_gap = features.get("avg_gap_days", 0)
    features["avg_gap_days"] = min(avg_gap, 30)
    
    # Yearly purchase count (cap at 52)
    yearly_count = features.get("yearly_purchase_count", 0)
    features["yearly_purchase_count"] = min(yearly_count, 52)
    
    # Average order value (cap at 200.0)
    avg_value = features.get("avg_order_value", 0.0)
    features["avg_order_value"] = min(avg_value, 200.0)
    
    # 2. String normalization
    if "primary_category" in features:
        features["primary_category"] = str(features["primary_category"]).lower().strip()
        
    if "discount_sensitivity" in features:
        features["discount_sensitivity"] = str(features["discount_sensitivity"]).lower().strip()
        
    # 3. Ensure float types for ratios
    if "online_ratio" in features:
        ratio = features["online_ratio"]
        features["online_ratio"] = max(0.0, min(float(ratio), 1.0))
        
    return features
