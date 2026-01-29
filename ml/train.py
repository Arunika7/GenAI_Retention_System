"""
This module serves as the Machine Learning model training pipeline.

Current Strategy (Phase 1 → Phase 2 Transition):
- Previously, the system relied on a rule-based engine (ml.churn_rules)
- This module now upgrades the system to a REAL supervised ML model

Key Notes:
1. Since no historical churn labels exist, churn labels are generated
   using a business-driven heuristic (days_since_last_visit > 60).
2. This enables training of a real ML model while maintaining explainability.
3. The trained model is serialized and ready for production inference.

Future Strategy (Phase 3):
- Replace heuristic churn labels with true observed churn outcomes
- Add advanced models (XGBoost) and Explainable AI (SHAP/LIME)
"""

import logging
import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# --------------------------------------------------
# Configure logging
# --------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --------------------------------------------------
# Training Function
# --------------------------------------------------
def train_churn_model(data_path: str, model_path: str = "ml/churn_model.pkl"):
    """
    Train a real ML-based churn prediction model.

    Args:
        data_path (str): Path to the training dataset (CSV/Parquet).
        model_path (str): Path to save the trained model.
    """
    logger.info("🚀 Starting churn model training process...")

    # --------------------------------------------------
    # 1. Load Data
    # --------------------------------------------------
    logger.info(f"📂 Loading training data from: {data_path}")

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Training data not found at {data_path}")

    if data_path.endswith(".csv"):
        df = pd.read_csv(data_path)
    else:
        df = pd.read_parquet(data_path)

    logger.info(f"Dataset loaded with shape: {df.shape}")

    # --------------------------------------------------
    # 2. Create Churn Label (if missing)
    # --------------------------------------------------
    if "churn" not in df.columns:
        # Check for alternate name "churned"
        if "churned" in df.columns:
             df["churn"] = df["churned"]
        else:
            logger.info(
            "⚠️ Churn label not found. Creating churn labels using business rule: "
            "days_since_last_purchase > 60")
            df["churn"] = (df["days_since_last_purchase"] > 60).astype(int)

    logger.info("Churn label distribution:")
    logger.info(df["churn"].value_counts().to_string())

    # --------------------------------------------------
    # 3. Feature Preparation
    # --------------------------------------------------
    FEATURES = [
    "yearly_purchase_count",
    "avg_gap_days",
    "days_since_last_purchase",
    "avg_order_value",
    "online_ratio",
    "discount_sensitivity"
    ]


    missing_features = [f for f in FEATURES if f not in df.columns]
    if missing_features:
        raise ValueError(f"Missing required features: {missing_features}")

    X = df[FEATURES]
    y = df["churn"]

    # Encode categorical discount sensitivity (Map to ordinal integers)
    if "discount_sensitivity" in X.columns:
        X["discount_sensitivity"] = X["discount_sensitivity"].map({
        "Low": 0,
        "Medium": 1,
        "High": 2
    })
    
    # CRITICAL FIX: Do NOT coerce the entire dataframe to numeric.
    # This destroys 'primary_category' (Grocery -> NaN).
    # Only coerce specific numerical columns if needed, but safe to skip if data is clean.
    # X = X.apply(pd.to_numeric, errors="coerce")  <-- REMOVED

    # Handle missing values (simple & safe)
    # Fill numeric NaNs with median, categorical with mode/constant
    for col in X.columns:
        if X[col].dtype == 'object':
            X[col] = X[col].fillna(X[col].mode()[0] if not X[col].mode().empty else "Unknown")
        else:
             X[col] = X[col].fillna(X[col].median())

    logger.info("✅ Feature preparation completed")

    # --------------------------------------------------
    # 4. Train / Test Split
    # --------------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    logger.info("🔀 Train-test split completed")

    # --------------------------------------------------
    # 5. Model Training (REAL ML)
    # --------------------------------------------------
    logger.info("🧠 Training RandomForest churn model...")

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        random_state=42,
        class_weight="balanced"
    )

    model.fit(X_train, y_train)

    logger.info("✅ Model training completed")

    # --------------------------------------------------
    # 6. Model Evaluation
    # --------------------------------------------------
    logger.info("📊 Evaluating model performance...")

    y_pred = model.predict(X_test)
    report = classification_report(y_test, y_pred)

    logger.info("Classification Report:\n" + report)

    # --------------------------------------------------
    # 7. Model Serialization
    # --------------------------------------------------
    # Ensure directory exists
    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    joblib.dump(model, model_path)

    logger.info(f"💾 Model successfully saved at: {model_path}")
    logger.info("🎉 Training pipeline completed successfully!")


# --------------------------------------------------
# Script Entry Point
# --------------------------------------------------
if __name__ == "__main__":
    train_churn_model("data/churn_training_data.csv")
