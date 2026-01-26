def calculate_churn_probability(customer_features: dict) -> float:
    """
    Calculate churn probability for a FreshMart customer using rule-based logic.
    
    Args:
        customer_features: Dictionary containing customer features with keys:
            - days_since_last_purchase (int): Days since last purchase
            - yearly_purchase_count (int): Total purchases per year
            - avg_gap_days (int): Average days between purchases
            - discount_sensitivity (str): Discount sensitivity level
            - online_ratio (float): Ratio of online vs offline purchases (0-1)
            - primary_category (str): Primary shopping category
    
    Returns:
        float: Churn probability between 0.0 and 1.0
    """
    
    # Extract features with defaults for missing values
    days_since_last = customer_features.get('days_since_last_purchase', 30)
    yearly_purchase_count = customer_features.get('yearly_purchase_count', 12)
    avg_gap_days = customer_features.get('avg_gap_days', 30)
    discount_sensitivity = customer_features.get('discount_sensitivity', 'medium').lower()
    online_ratio = customer_features.get('online_ratio', 0.5)
    primary_category = customer_features.get('primary_category', 'grocery').lower()
    
    # Normalize input values to 0-1 scale
    # Higher values indicate higher churn risk
    
    # 1. Recency score (40% weight) - more days since last purchase = higher churn risk
    normalized_days_since_last = min(days_since_last / 90, 1.0)  # 90 days = maximum risk
    
    # 2. Frequency score (25% weight) - larger gaps between purchases = higher churn risk
    normalized_avg_gap = min(avg_gap_days / 30, 1.0)  # 30 days gap = maximum risk
    
    # 3. Volume score (20% weight) - fewer purchases per year = higher churn risk
    # Invert because fewer purchases = higher risk
    normalized_purchase_count = min(yearly_purchase_count / 52, 1.0)  # 52 weekly purchases = minimum risk
    volume_risk = 1 - normalized_purchase_count
    
    # 4. Discount sensitivity score (10% weight) - higher sensitivity = higher churn risk
    discount_score = 0.0
    if discount_sensitivity in ["high", "very high"]:
        discount_score = 0.3
    elif discount_sensitivity in ["medium", "moderate"]:
        discount_score = 0.15
    elif discount_sensitivity in ["low", "very low"]:
        discount_score = 0.0
    
    # 5. Online preference score (5% weight) - very high online ratio may indicate lower loyalty
    online_score = online_ratio * 0.1 if online_ratio > 0.7 else 0
    
    # Calculate base churn probability using weighted components
    churn_probability = (
        normalized_days_since_last * 0.40 +      # 40% weight to recency
        normalized_avg_gap * 0.25 +              # 25% weight to purchase frequency
        volume_risk * 0.20 +                     # 20% weight to purchase volume
        discount_score * 0.10 +                  # 10% weight to discount sensitivity
        online_score * 0.05                      # 5% weight to online preference
    )
    
    # Category-based adjustments
    # Essential categories have lower churn, discretionary have higher churn
    if primary_category in ["pharmacy", "personal care", "baby care"]:
        churn_probability *= 0.8  # 20% reduction for essential categories
    elif primary_category in ["household", "electronics", "fashion"]:
        churn_probability *= 1.2  # 20% increase for discretionary categories
    elif primary_category in ["grocery", "fresh produce", "dairy"]:
        churn_probability *= 0.9  # 10% reduction for regular grocery categories
    
    # Ensure probability stays within valid bounds
    churn_probability = max(0.0, min(churn_probability, 1.0))
    
    return churn_probability


def get_risk_level(churn_probability: float) -> str:
    """
    Convert churn probability to risk level.
    
    Args:
        churn_probability: Churn probability between 0.0 and 1.0
    
    Returns:
        str: Risk level ('Low', 'Medium', or 'High')
    """
    if churn_probability >= 0.7:
        return "High"
    elif churn_probability >= 0.4:
        return "Medium"
    else:
        return "Low"


def get_confidence_score(churn_probability: float) -> float:
    """
    Calculate confidence score based on how extreme the probability is.
    
    Args:
        churn_probability: Churn probability between 0.0 and 1.0
    
    Returns:
        float: Confidence score between 0.0 and 1.0
    """
    # Higher confidence for more extreme probabilities (closer to 0 or 1)
    distance_from_middle = abs(churn_probability - 0.5)
    confidence = 0.65 + (distance_from_middle * 0.4)  # Range: 0.65 to 0.85
    return min(confidence, 0.85)


def generate_recommendations(customer_features: dict, risk_level: str) -> list:
    """
    Generate FreshMart-specific recommendations based on customer features and risk level.
    
    Args:
        customer_features: Dictionary containing customer features
        risk_level: Calculated risk level ('Low', 'Medium', or 'High')
    
    Returns:
        list: List of recommendation strings
    """
    primary_category = customer_features.get('primary_category', 'grocery')
    discount_sensitivity = customer_features.get('discount_sensitivity', 'medium').lower()
    online_ratio = customer_features.get('online_ratio', 0.5)
    
    recommendations = []
    
    if risk_level == "High":
        recommendations.extend([
            f"Send personalized {primary_category} coupon bundle",
            "Enroll in FreshMart Rewards Plus program with bonus points",
            "Schedule personal shopping assistant consultation",
            "Offer free delivery on next 3 orders"
        ])
    elif risk_level == "Medium":
        recommendations.extend([
            f"Send targeted {primary_category} promotions",
            "Double loyalty points for next month",
            "Personalized weekly deals based on purchase history"
        ])
    else:
        recommendations.extend([
            "Maintain regular engagement through FreshMart app",
            f"Provide exclusive early access to {primary_category} new arrivals",
            "Share personalized shopping tips and recipes"
        ])
    
    # Add discount-specific recommendations
    if discount_sensitivity in ["high", "very high"]:
        recommendations.append("Send exclusive flash sale notifications")
    
    # Add online-specific recommendations
    if online_ratio > 0.7:
        recommendations.append("Highlight online-exclusive deals and app-only coupons")
    
    return recommendations