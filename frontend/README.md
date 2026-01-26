# FreshMart Customer Retention System - Frontend Dashboard

## &nbsp;Overview
The **FreshMart Retention Intelligence Dashboard** is a modern, responsive web application designed for business analysts and retention specialists. It interfaces with the FreshMart GenAI backend to provide real-time churn prediction, risk assessment, and explainable AI insights for retail customer behavior.

This frontend serves as the primary touchpoint for decision-makers, offering a streamlined workflow to input customer data, visualize risk probabilities, and receive actionable, AI-generated retention strategies.

## &nbsp;Key Features
*   **Interactive Analyst Interface**: Use the **ChurnForm** to input granular customer behavioral signals (e.g., purchase frequency, discount sensitivity, online ratio).
*   **Real-time Risk Prediction**: Instant visualization of churn probability and risk levels (Low/Medium/High) via the **PredictionCard**.
*   **Explainable AI (XAI)**: The **ExplanationPanel** provides natural language narratives and key driver analysis, building trust in model outputs.
*   **Actionable Recommendations**: Automatically generated, context-aware retention strategies tailored to the customer's specific profile.
*   **Responsive Design**: Built with a mobile-first approach using Tailwind CSS, suitable for desktop and tablet review.

## &nbsp;Technology Stack
*   **Core Framework**: React 18
*   **Build Tool**: Vite (for high-performance development and bundling)
*   **Styling**: Tailwind CSS (Utility-first styling)
*   **HTTP Client**: Axios (Optimized for API communication)
*   **State Management**: React Hooks (useState, useEffect)

## &nbsp;Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm (v9 or higher)
*   Running instance of the FreshMart Backend API (usually on port 8000)

### Installation
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (default Vite port).

## &nbsp;Backend Integration
This dashboard communicates with the backend via RESTful APIs.

*   **Base URL**: Configurable in `src/services/api.js` (Default: `http://127.0.0.1:8000`)
*   **Primary Endpoint**: `POST /api/churn/predict`
*   **Payload Structure**:
    ```json
    {
      "customer_id": "string",
      "primary_category": "string",
      "yearly_purchase_count": int,
      "avg_gap_days": int,
      "avg_order_value": float,
      "days_since_last_purchase": int,
      "discount_sensitivity": "string",
      "online_ratio": float
    }
    ```

## &nbsp;Production Readiness & Roadmap
To elevate this application to a production environment, the following enhancements are recommended:

1.  **Environment Configuration**: Move API base URLs to `.env` files (e.g., `VITE_API_BASE_URL`).
2.  **Authentication/Authorization**: Integrate OIDC or OAuth2 (e.g., Auth0, Azure AD) for secure access.
3.  **Advanced Visualization**: Implement charting libraries (Recharts or Chart.js) for historical trend analysis.
4.  **Testing**: Add unit tests (Vitest/Jest) and end-to-end tests (Cypress/Playwright).
5.  **CI/CD**: Configure automated build and deployment pipelines (e.g., GitHub Actions, Docker).

---
*© 2026 FreshMart Data Engineering Team. All rights reserved.*
