
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/churn"
CUSTOMER_ID = "FM_CUST_000001" # Known valid ID

def test_health():
    print("Testing /health...", end=" ")
    try:
        r = requests.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            print("OK")
            return True
        else:
            print(f"FAILED ({r.status_code})")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_customers_search():
    print("Testing /customers (search)...", end=" ")
    try:
        r = requests.get(f"{BASE_URL}/customers?search={CUSTOMER_ID}")
        if r.status_code == 200:
            data = r.json()
            if data['total'] > 0 and data['data'][0]['id'] == CUSTOMER_ID:
                print("OK")
                return True
            else:
                print(f"FAILED (Customer not found in search)")
                print(data)
                return False
        else:
            print(f"FAILED ({r.status_code})")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_predict():
    print("Testing /predict...", end=" ")
    payload = {
        "customer_id": CUSTOMER_ID,
        "days_since_last_purchase": 45,
        "yearly_purchase_count": 10,
        "avg_gap_days": 15,
        "discount_sensitivity": "High",
        "online_ratio": 0.5,
        "primary_category": "Produce",
        "avg_order_value": 75.0
    }
    try:
        r = requests.post(f"{BASE_URL}/predict", json=payload)
        if r.status_code == 200:
            print("OK")
            return True
        else:
            print(f"FAILED ({r.status_code}) - {r.text}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_simulate():
    print("Testing /simulate...", end=" ")
    payload = {
        "customer_id": CUSTOMER_ID,
        "planned_discount": 10,
        "loyalty_points_bonus": 500,
        "intervention_channel": "Email"
    }
    try:
        r = requests.post(f"{BASE_URL}/simulate", json=payload)
        if r.status_code == 200:
            print("OK")
            return True
        else:
            print(f"FAILED ({r.status_code}) - {r.text}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    print(f"Starting Backend Health Check (Target: {BASE_URL})\n")
    
    results = [
        test_health(),
        test_customers_search(),
        test_predict(),
        test_simulate()
    ]
    
    if all(results):
        print("\n✅ All Backend Tests Passed!")
        sys.exit(0)
    else:
        print("\n❌ Some Tests Failed!")
        sys.exit(1)
