import requests
import json

BASE_URL = "http://localhost:8000/api/churn"

def test_competitor_risk():
    # Customer FM_CUST_000010 has Primary Category 'Grocery'
    # Competitor Price for Grocery: 105 vs FreshMart 120 -> 12.5% gap
    
    customer_id = "FM_CUST_000010"
    print(f"\n--- Testing {customer_id} with DIRECT payload ---")
    
    # Hardcoded profile from CSV
    # FM_CUST_000010,29,Female,New York,37,Grocery,Baby Care,56,59,2341,Low,0.08,9
    payload = {
        "customer_id": customer_id,
        "primary_category": "Grocery",
        "yearly_purchase_count": 56,
        "avg_gap_days": 59,
        "avg_order_value": 2341.0,
        "days_since_last_purchase": 9,
        "discount_sensitivity": "Low",
        "online_ratio": 0.08
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
    print(f"Explanation: {result['explanation_summary']}")
    
    with open("test_result.txt", "w") as f:
        json.dump(result, f, indent=2)

    if "competitor" in json.dumps(result).lower() or "price difference" in json.dumps(result).lower():
        print("\nSUCCESS: Competitor analysis detected in response.")
    else:
        print("\nWARNING: Competitor analysis NOT found in response.")

if __name__ == "__main__":
    test_competitor_risk()
