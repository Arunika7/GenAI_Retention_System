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
                # Convert single dictionary to DataFrame for Scikit-Learn
                input_df = pd.DataFrame([features])
                
                # Ensure columns match training data order/names roughly
                # The Pipeline handles the rest
                
                # Get probability for class 1 (Churn)
                prob = self.model.predict_proba(input_df)[0][1]
                return float(prob)
            except Exception as e:
                logger.error(f"Prediction error: {e}")
        
        # Fallback (Heuristic Rule) if model fails
        return self._heuristic_fallback(features)

    def _heuristic_fallback(self, features: dict) -> float:
        """Original rule-based logic as safeguard."""
        days = min(features.get('days_since_last_purchase', 0) / 90, 1.0)
        vol = min(features.get('yearly_purchase_count', 0) / 52, 1.0)
        return (days * 0.5) + ((1 - vol) * 0.3)

# Singleton instance
churn_model_service = ChurnModel()
