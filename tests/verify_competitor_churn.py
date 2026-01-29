import requests
import json

BASE_URL = "http://localhost:8000"

def test_competitor_risk():
    # Customer FM_CUST_000010 has Primary Category 'Grocery'
    # Competitor Price for Grocery: 105 vs FreshMart 120 -> 12.5% gap
    
    customer_id = "FM_CUST_000010"
    
    # Feature payload (simplified for testing, API takes CustomerFeatures)
    # We first fetch the profile to get realistic data, then send it back to predict
    
    print(f"Fetching profile for {customer_id}...")
    resp = requests.get(f"{BASE_URL}/customer/{customer_id}")
    if resp.status_code != 200:
        print("Failed to fetch customer profile")
        print(resp.text)
        return

    profile = resp.json()
    print(f"Primary Category: {profile['primary_category']}")
    
    # Construct prediction payload
    payload = {
        "customer_id": profile["customer_id"],
        "primary_category": profile["primary_category"],
        "yearly_purchase_count": profile["yearly_purchase_count"],
        "avg_gap_days": profile["avg_gap_days"],
        "avg_order_value": profile["avg_order_value"],
        "days_since_last_purchase": profile["days_since_last_purchase"],
        "discount_sensitivity": profile["discount_sensitivity"],
        "online_ratio": profile["online_ratio"]
    }
    
    print("Requesting churn prediction...")
    pred_resp = requests.post(f"{BASE_URL}/predict", json=payload)
    
    if pred_resp.status_code != 200:
        print("Prediction failed")
        print(pred_resp.text)
        return
        
    result = pred_resp.json()
    print("\nPrediction Result:")
    print(f"Churn Probability: {result['churn_probability']}")
    print(f"Risk Level: {result['churn_risk']}")
    print(f"Recommendations: {result['recommendations']}")
    print(f"Explanation: {result['explanation_summary']}")
    
    # Verification
    # We expect probability to be high(er) and explanation to mention competitor.
    # Note: probability increases by 0.15 if gap > 10%.
    
    if "competitor" in json.dumps(result).lower() or "price difference" in json.dumps(result).lower():
        print("\nSUCCESS: Competitor analysis detected in response.")
    else:
        print("\nWARNING: Competitor analysis NOT found in response.")

if __name__ == "__main__":
    test_competitor_risk()
