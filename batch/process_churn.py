import pandas as pd
import sqlite3
import sys
import os
import json

# Add the project root to the python path so we can import from ml
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.features import prepare_features
from ml.churn_rules import calculate_churn_probability, get_risk_level, get_confidence_score, generate_recommendations

DATA_PATH = os.path.join("data", "freshmart_customers_big.csv")
DB_PATH = os.path.join("data", "churn.db")

def process_customers():
    print("Starting batch churn prediction job...")
    
    # 1. Load Data
    try:
        df = pd.read_csv(DATA_PATH)
        print(f"Loaded {len(df)} customer records.")
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    results = []

    # 2. Process each customer
    print("Calculating churn probabilities...")
    for _, row in df.iterrows():
        customer_data = row.to_dict()
        
        # Preprocess
        features = prepare_features(customer_data)
        
        # Predict
        churn_prob = calculate_churn_probability(features)
        risk_level = get_risk_level(churn_prob)
        confidence = get_confidence_score(churn_prob)
        recommendations = generate_recommendations(features, risk_level)
        
        # We also want to explain WHY (Key contributing factors)
        # Re-using logic from churn_rules indirectly or inferring:
        factors = []
        if features.get('days_since_last_purchase', 0) > 60:
            factors.append("High days since last purchase")
        if features.get('yearly_purchase_count', 0) < 10:
            factors.append("Low purchase frequency")
        if features.get('discount_sensitivity') == 'high':
            factors.append("High discount sensitivity")
        
        results.append({
            "customer_id": str(customer_data['customer_id']),
            "churn_probability": churn_prob,
            "churn_risk": risk_level,
            "factors": json.dumps(factors),
            "recommendations": json.dumps(recommendations)
        })

    # 3. Rank and Select Top 100
    results_df = pd.DataFrame(results)
    top_risk_df = results_df.sort_values(by="churn_probability", ascending=False).head(100)
    
    print(f"Identified top {len(top_risk_df)} at-risk customers.")

    # 4. Store in SQLite
    try:
        conn = sqlite3.connect(DB_PATH)
        # improved schema with proper types
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS at_risk_customers (
            customer_id TEXT PRIMARY KEY,
            churn_probability REAL,
            churn_risk TEXT,
            factors TEXT,
            recommendations TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        conn.execute(create_table_sql)
        
        # Clear old data? For a daily batch, replacing is likely desired.
        conn.execute("DELETE FROM at_risk_customers")
        
        top_risk_df.to_sql("at_risk_customers", conn, if_exists="append", index=False)
        conn.commit()
        conn.close()
        print(f"Successfully saved results to {DB_PATH}")
        
    except Exception as e:
        print(f"Error saving to database: {e}")

if __name__ == "__main__":
    process_customers()
