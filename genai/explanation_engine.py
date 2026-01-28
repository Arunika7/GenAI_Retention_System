import os
import json
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class GenAIExplanationEngine:
    """
    Leverages Groq API (Llama 3) to generate human-readable, business-friendly
    explanations for customer churn predictions.
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            logger.warning("GROQ_API_KEY not found in .env. Explanations might fail.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
            
    def generate_explanation(self, customer_features: dict, churn_probability: float, churn_risk: str, context: dict = None) -> dict:
        """
        Generate a comprehensive, narrative explanation for the churn prediction using LLM.
        """
        if not self.client:
            return self._fallback_explanation(customer_features, churn_risk)

        try:
            # 1. Prepare Prompt
            prompt = self._construct_prompt(customer_features, churn_probability, churn_risk, context)
            
            # 2. Call Groq API
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert Customer Retention Analyst for a retail chain. Your job is to analyze customer data and explain WHY a customer is at risk of churning in simple, business-friendly language. You also provide actionable recommendations. Output ONLY valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                response_format={"type": "json_object"},
            )
            
            # 3. Parse Response
            response_content = chat_completion.choices[0].message.content
            parsed_response = json.loads(response_content)
            
            # User might get slightly different keys, so we ensure standardization
            result = {
                "summary": parsed_response.get("summary", "Analysis unavailable."),
                "key_factors": parsed_response.get("key_factors", []),
                "recommended_actions": parsed_response.get("recommended_actions", [])
            }
            return result
            
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            return self._fallback_explanation(customer_features, churn_risk)

    def generate_outreach_draft(self, customer_features: dict, intervention: dict) -> dict:
        """
        Generate a highly personalized outreach message for a customer based on 
        the proposed retention intervention.
        """
        if not self.client:
            return {
                "subject_line": "Special offer for you",
                "message_body": "We miss you at FreshMart. Check out our latest deals!",
                "channel_optimized": "Email"
            }

        try:
            prompt = f"""
            Draft a personalized retention message for a FreshMart customer.
            
            **Customer Context:**
            - Customer ID: {customer_features.get('customer_id')}
            - Primary Category: {customer_features.get('primary_category')}
            - Days Since Last Purchase: {customer_features.get('days_since_last_purchase')}
            - Spending Level: {customer_features.get('avg_order_value')} average
            
            **Proposed Intervention:**
            - Type: {intervention.get('type')}
            - Details: {intervention.get('details')}
            
            **Guidelines:**
            - Tone: Warm, helpful, and exclusive.
            - Mention their favorite category ({customer_features.get('primary_category')}).
            - Make the offer ({intervention.get('details')}) the star of the message.
            - Keep it concise for mobile reading.
            
            **Format:**
            Return JSON with keys: 'subject_line', 'message_body', 'channel_optimized'.
            """

            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional Customer Relationship Copywriter for FreshMart. You specialize in high-conversion, empathetic retention messaging. Output ONLY valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.8,
                response_format={"type": "json_object"},
            )

            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)

        except Exception as e:
            logger.error(f"Outreach generation failed: {e}")
            return {
                "subject_line": f"Exclusive FreshMart Offer for you!",
                "message_body": f"We've got something special for your next {customer_features.get('primary_category')} shop. See you soon!",
                "channel_optimized": "Email"
            }

    def _construct_prompt(self, features: dict, prob: float, risk: str, context: dict = None) -> str:
        
        competitor_text = ""
        if context and context.get("competitor_data") and context["competitor_data"].get("has_risk"):
            data = context["competitor_data"]
            competitor_text = f"""
            **Competitor Alert:**
            - Competitor '{data.get('competitor_name')}' is selling '{features.get('primary_category')}' for ${data.get('competitor_price')} (Gap: {data.get('gap_pct'):.1%}).
            - This is a critical churn driver. You MUST mention this price difference as a key reason for churn.
            - Recommendation: Suggest a price match or counter-offer.
            """

        return f"""
        Analyze this customer for churn risk.
        
        {competitor_text}
        
        **Customer Profile:**
        - Churn Risk Level: {risk}
        - Churn Probability: {prob:.2%}
        - Primary Category: {features.get('primary_category')}
        - Days Since Last Purchase: {features.get('days_since_last_purchase')}
        - Yearly Purchases: {features.get('yearly_purchase_count')}
        - Average Gap Between Purchases: {features.get('avg_gap_days')} days
        - Discount Sensitivity: {features.get('discount_sensitivity')}
        - Online Shopping Ratio: {features.get('online_ratio') * 100:.0f}%
        
        **Task:**
        1. Write a 'summary' (2-3 sentences) explaining the situation to a store manager. Be empathetic but professional.
        2. Identify 2-3 'key_factors' contributing to this risk (e.g., "High price sensitivity", "Long absence").
        3. Suggest 3 specific 'recommended_actions' to retain them.
        
        **Format:**
        Return a single JSON object with keys: "summary", "key_factors", "recommended_actions".
        """

    def _fallback_explanation(self, features: dict, risk_level: str) -> dict:
        """Fallback to simple rule-based logic if API fails."""
        logger.info("Using fallback explanation logic.")
        return {
            "summary": f"Customer is at {risk_level} risk. Please review recent transaction history.",
            "key_factors": ["Manual review required"],
            "recommended_actions": ["Contact customer service"]
        }
