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

        customer = {
            "customer_id": f"FM_CUST_{i+1:06d}",
            "age": random.randint(18, 75),
            "gender": random.choice(["Male", "Female", "Non-binary"]),
            "location": random.choice(locations),
            "tenure_months": random.randint(1, 120),
            "primary_category": primary,
            "secondary_category": secondary,
            "yearly_purchase_count": random.randint(1, 60),
            "avg_gap_days": random.randint(3, 90),
            "avg_order_value": random.randint(200, 3000),
            "discount_sensitivity": random.choice(["Low", "Medium", "High"]),
            "online_ratio": round(random.uniform(0.0, 1.0), 2),
            "days_since_last_purchase": random.randint(1, 180)
        }

        data.append(customer)

    df = pd.DataFrame(data)
    df.to_csv("data/freshmart_customers_big.csv", index=False)

    print(f"Generated {n} FreshMart-style customer records successfully with demographics 🚀")

if __name__ == "__main__":
    generate_freshmart_customers()
