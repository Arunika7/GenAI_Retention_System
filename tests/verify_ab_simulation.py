
import sys
import os
import json
from fastapi.testclient import TestClient

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app

def verify_ab_simulation():
    print("Verifying A/B Simulation Endpoint...")
    client = TestClient(app)
    
    # payload
    payload = {
        "customer_id": "C001",
        "strategy_a": {
            "name": "Strategy A",
            "planned_discount": 10,
            "loyalty_points_bonus": 0
        },
        "strategy_b": {
            "name": "Strategy B",
            "planned_discount": 0,
            "loyalty_points_bonus": 500
        }
    }
    
    try:
        response = client.post("/api/churn/simulate-comparison", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS: Endpoint returned 200 OK")
            print(json.dumps(data, indent=2))
            
            # Basic sanity checks
            if data["winner"]:
                print(f"Winner declared: {data['winner']}")
            else:
                print("FAILURE: No winner declared")
                
            if "net_retention_score" in data["strategy_a"]:
                 print("Structure check passed.")
            else:
                 print("FAILURE: Missing net_retention_score in strategy_a")
                 
        else:
            print(f"FAILURE: Status {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"FAILURE: Exception occurred: {e}")

if __name__ == "__main__":
    verify_ab_simulation()
