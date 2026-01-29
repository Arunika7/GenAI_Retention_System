import pandas as pd
import random

def generate_freshmart_customers(n=50000):
    categories = [
        "Grocery",
        "Pharmacy",
        "Personal Care",
        "Baby Care",
        "Household Essentials",
        "Dairy & Bakery",
        "Snacks & Beverages",
        "Electronics",
        "Home & Kitchen",
        "Seasonal Items"
    ]

    locations = ["New York", "Chicago", "San Francisco", "Austin", "Seattle", "Miami", "Boston", "Denver"]
    
    data = []

    for i in range(n):
        primary = random.choice(categories)
        secondary = random.choice([c for c in categories if c != primary])
        
        # Features
        days_since_last = random.randint(1, 180)
        yearly_purchases = random.randint(1, 60)
        avg_gap = random.randint(3, 90)
        discount_sen = random.choice(["Low", "Medium", "High"])
        online = round(random.uniform(0.0, 1.0), 2)
        
        # --- Generate "Ground Truth" Label (Simulating History) ---
        # We use a probabilistic formula to decide if they churned
        # This gives the ML model a pattern to find.
        
        risk_score = 0
        if days_since_last > 60: risk_score += 0.4
        if yearly_purchases < 5: risk_score += 0.3
        if avg_gap > 45: risk_score += 0.2
        if discount_sen == "High": risk_score += 0.1
        
        # Add randomness so it's not a perfect rule (Real life is messy)
        risk_score += random.uniform(-0.1, 0.1)
        
        churned = 1 if risk_score > 0.5 else 0

        customer = {
            "customer_id": f"FM_HIST_{i+1:06d}", # different ID series for history
            "age": random.randint(18, 75),
            "gender": random.choice(["Male", "Female", "Non-binary"]),
            "location": random.choice(locations),
            "tenure_months": random.randint(1, 120),
            "primary_category": primary,
            "secondary_category": secondary,
            "yearly_purchase_count": yearly_purchases,
            "avg_gap_days": avg_gap,
            "avg_order_value": random.randint(200, 3000),
            "discount_sensitivity": discount_sen,
            "online_ratio": online,
            "days_since_last_purchase": days_since_last,
            "churned": churned  # The Target Variable
        }

        data.append(customer)

    df = pd.DataFrame(data)
    
    # Save Training Data
    df.to_csv("data/churn_training_data.csv", index=False)
    print(f"Generated {n} labeled training records to data/churn_training_data.csv 🧠")
    
    # Also save the 'current' customers file (unlabeled) for the app to use
    # We drop the 'churned' column for the "live" data simulation
    df_live = df.drop(columns=["churned"]).copy()
    df_live["customer_id"] = [f"FM_CUST_{i+1:06d}" for i in range(n)] # Reset IDs
    df_live.to_csv("data/freshmart_customers_big.csv", index=False)
    print(f"Generated {n} live customer records to data/freshmart_customers_big.csv 🛍️")

if __name__ == "__main__":
    generate_freshmart_customers()
