import joblib
import pandas as pd
import logging
import os

logger = logging.getLogger(__name__)

class ChurnModel:
    def __init__(self, model_path="ml/churn_model.pkl"):
        self.model = None
        self.model_path = model_path
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                logger.info(f"✅ Loaded Random Forest Model from {self.model_path}")
            except Exception as e:
                logger.error(f"❌ Failed to load model: {e}")
                self.model = None
        else:
            logger.warning(f"⚠️ Model file not found at {self.model_path}. Using fallback.")

    def predict_churn_probability(self, features: dict) -> float:
        """
        Predict probability using the trained model.
        Falls back to rule-based heuristic if model is missing.
        """
        if self.model:
            try:
                # Features expected by the model in exact order (from train.py)
                expected_features = [
                    "yearly_purchase_count",
                    "avg_gap_days",
                    "days_since_last_purchase",
                    "avg_order_value",
                    "online_ratio",
                    "discount_sensitivity"
                ]

                # Preprocessing: Handle discount_sensitivity encoding
                # Map string values to integers as done in training
                sensitivity_map = {"Low": 0, "Medium": 1, "High": 2}
                
                # Create a copy to avoid modifying the input dict
                processed_features = features.copy()
                
                raw_sens = processed_features.get("discount_sensitivity", "Medium")
                processed_features["discount_sensitivity"] = sensitivity_map.get(raw_sens, 1) # Default to Medium (1)

                # Convert to DataFrame with specific columns and order
                # This drops extra columns (like primary_category) and enforces order
                input_df = pd.DataFrame([processed_features])[expected_features]
                
                # Get probability for class 1 (Churn)
                prob = self.model.predict_proba(input_df)[0][1]
                return float(prob)
            except Exception as e:
                logger.error(f"Prediction error: {e}")
        
        # Fallback (Heuristic Rule) if model fails
        return self._heuristic_fallback(features)

    def predict_churn_batch(self, features_list: list) -> list:
        """
        Batch predict probability for a list of customers.
        """
        if not features_list:
            return []

        if self.model:
            try:
                expected_features = [
                    "yearly_purchase_count",
                    "avg_gap_days",
                    "days_since_last_purchase",
                    "avg_order_value",
                    "online_ratio",
                    "discount_sensitivity"
                ]
                sensitivity_map = {"Low": 0, "Medium": 1, "High": 2}

                # Preprocessing loop (faster than DataFrame apply for list of dicts)
                processed_list = []
                for f in features_list:
                    pf = f.copy()
                    raw_sens = pf.get("discount_sensitivity", "Medium")
                    pf["discount_sensitivity"] = sensitivity_map.get(raw_sens, 1)
                    processed_list.append(pf)
                
                # Bulk DataFrame creation
                input_df = pd.DataFrame(processed_list)[expected_features]
                
                # Bulk Prediction
                # predict_proba returns [ [prob_0, prob_1], ... ]
                probs = self.model.predict_proba(input_df)[:, 1]
                return probs.tolist()
            except Exception as e:
                logger.error(f"Batch prediction error: {e}")
        
        # Fallback loop
        return [self._heuristic_fallback(f) for f in features_list]

    def _heuristic_fallback(self, features: dict) -> float:
        """Original rule-based logic as safeguard."""
        days = min(features.get('days_since_last_purchase', 0) / 90, 1.0)
        vol = min(features.get('yearly_purchase_count', 0) / 52, 1.0)
        return (days * 0.5) + ((1 - vol) * 0.3)

# Singleton instance
churn_model_service = ChurnModel()
