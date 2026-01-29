import shap
import joblib
import pandas as pd
import os
import logging
from ml.features import prepare_features

logger = logging.getLogger(__name__)

# --------------------------------------------------
# Load trained ML model
# --------------------------------------------------
# Adjust path to be relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "churn_model.pkl")

Model = None
Explainer = None

try:
    if os.path.exists(MODEL_PATH):
        # Load the whole pipeline
        Model = joblib.load(MODEL_PATH)
        
        # SHAP needs the *model* (Random Forest), not the full pipeline with preprocessors
        # Our pipeline is: [('preprocessor', ...), ('classifier', RandomForest...)]
        if hasattr(Model, "named_steps"):
            rf_model = Model.named_steps['classifier']
            Explainer = shap.TreeExplainer(rf_model)
            logger.info("✅ SHAP Explainer initialized successfully.")
        else:
            # Fallback if just the model was saved
            Explainer = shap.TreeExplainer(Model)
    else:
        logger.warning(f"⚠️ trained model not found at {MODEL_PATH}. Explanations will be heuristic.")
except Exception as e:
    logger.error(f"❌ Failed to initialize SHAP: {e}")

def explain_churn_decision(customer_features: dict, churn_probability: float) -> dict:
    """
    Explain the churn prediction using SHAP (Explainable AI).
    """
    if not Explainer or not Model:
        return _heuristic_fallback(customer_features, churn_probability)
        
    try:
        # 1. Prepare features 
        # We need to construct a DataFrame that matches what the *Classifier* expects
        # BUT, the classifier expects input from the Preprocessor. 
        # TreeExplainer on the RF needs *Transformed* features. 
        # This is complex with Pipelines.
        # SIMPLIFICATION for Demo: We will pass the raw dataframe to the *Pipeline* to transform it,
        # then pass that to the explainer.
        
        # Construct DataFrame
        df = pd.DataFrame([customer_features])
        
        # Transform features using the pipeline's preprocessor
        preprocessor = Model.named_steps['preprocessor']
        transformed_X = preprocessor.transform(df)
        
        # Get feature names from preprocessor (tricky for OneHot)
        # We'll rely on the explainer to handle the matrix or generic feature names for now
        # Or better, we explicitly extract feature names if possible
        try:
            feature_names = preprocessor.get_feature_names_out()
        except:
            feature_names = [f"Feature {i}" for i in range(transformed_X.shape[1])]

        # 2. Calculate SHAP values
        shap_values = Explainer.shap_values(transformed_X)

        # Handle different SHAP output formats (Binary classification usually returns list of [neg, pos])
        if isinstance(shap_values, list):
            # outcome 1 is Churn
            vals = shap_values[1][0] 
        else:
            vals = shap_values[0]

        # 3. Map feature → contribution
        feature_impacts = {}
        for name, impact in zip(feature_names, vals):
            feature_impacts[name] = float(impact)

        # Sort by absolute impact
        sorted_impacts = sorted(
            feature_impacts.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )

        # Top contributing feature
        top_feature, top_impact = sorted_impacts[0]
        
        # Clean up feature name (e.g. "num__days_since..." -> "Days Since Purchase")
        clean_name = top_feature.split("__")[-1].replace("_", " ").title()

        direction = "increased" if top_impact > 0 else "reduced"
        explanation_text = (
            f"The churn risk is primarily driven by '{clean_name}', "
            f"which {direction} the probability."
        )

        return {
            "top_churn_driver": clean_name,
            "driver_impact": round(float(top_impact), 3),
            "explanation": explanation_text,
            "all_feature_impacts": {k.split("__")[-1]: round(v, 3) for k, v in sorted_impacts[:5]} # Top 5
        }

    except Exception as e:
        logger.error(f"SHAP explanation failed: {e}")
        return _heuristic_fallback(customer_features, churn_probability)

def _heuristic_fallback(features, prob):
    """Fallback if SHAP fails"""
    return {
        "top_churn_driver": "Behavioral Pattern",
        "driver_impact": 0.0,
        "explanation": "High risk detected based on recency and frequency patterns.",
        "all_feature_impacts": {}
    }
