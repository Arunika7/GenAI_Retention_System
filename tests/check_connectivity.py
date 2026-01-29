
import requests
import json

def check_server():
    url = "http://127.0.0.1:8000/api/churn/simulate-comparison"
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
        print(f"Sending POST request to {url}...")
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success! Server is reachable and responding.")
        else:
            print(f"Failed. Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("CONNECTION ERROR: Could not connect to the server. Is it running on port 8000?")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    check_server()
