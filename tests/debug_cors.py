
import requests

def debug_cors():
    url = "http://127.0.0.1:8000/api/churn/simulate-comparison"
    origin = "http://localhost:5173"
    
    print(f"Testing CORS for {url} from Origin {origin}")
    
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    
    try:
        print("\n--- SENDING OPTIONS REQUEST (PREFLIGHT) ---")
        response = requests.options(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        for k, v in response.headers.items():
            if 'access-control' in k.lower():
                print(f"  {k}: {v}")
                
        if response.status_code == 200:
            print("OPTIONS request successful.")
            if 'Access-Control-Allow-Origin' in response.headers:
                print(f"Allowed Origin: {response.headers['Access-Control-Allow-Origin']}")
            else:
                print("WARNING: Missing Access-Control-Allow-Origin header!")
        else:
            print("OPTIONS request FAILED.")

    except Exception as e:
        print(f"Exception during OPTIONS: {e}")

    try:
        print("\n--- SENDING POST REQUEST (ACTUAL) ---")
        # Valid payload to avoid 422/404 if possible, but 404 is fine for CORS check
        payload = {
            "customer_id": "C001", 
            "strategy_a": {"name": "A"},
            "strategy_b": {"name": "B"}
        }
        # Note: requests doesn't add Origin by default, we force it
        response = requests.post(url, json=payload, headers={"Origin": origin})
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        for k, v in response.headers.items():
            if 'access-control' in k.lower():
                print(f"  {k}: {v}")

    except Exception as e:
        print(f"Exception during POST: {e}")

if __name__ == "__main__":
    debug_cors()
