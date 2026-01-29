
import sys
import os
import sqlite3
import json
from fastapi.testclient import TestClient

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app

def verify_db():
    print("Verifying Database...")
    conn = sqlite3.connect("data/churn.db")
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM at_risk_customers")
    count = cursor.fetchone()[0]
    print(f"Total rows in DB: {count}")
    
    cursor.execute("SELECT * FROM at_risk_customers LIMIT 1")
    row = cursor.fetchone()
    print(f"Sample row: {row}")
    conn.close()
    
    if count == 100:
        print("SUCCESS: Database contains 100 records.")
    else:
        print(f"FAILURE: Database contains {count} records, expected 100.")

def verify_api():
    print("\nVerifying API Endpoint /api/churn/top-risk...")
    client = TestClient(app)
    response = client.get("/api/churn/top-risk")
    
    if response.status_code == 200:
        data = response.json()
        print(f"API returned {len(data)} records.")
        if len(data) > 0:
            print(f"Sample API record: {data[0]}")
            
        if len(data) == 100:
             print("SUCCESS: API returned 100 records.")
        else:
             print(f"FAILURE: API returned {len(data)} records.")
    else:
        print(f"FAILURE: API returned status {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    verify_db()
    verify_api()
