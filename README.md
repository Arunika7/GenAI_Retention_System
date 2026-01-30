# FreshMart GenAI Customer Retention System

A comprehensive, full-stack solution designed to predict customer churn and generate personalized retention strategies using GenAI reasoning.

## 🚀 Project Overview
This system combines a high-performance **FastAPI backend** with a modern **React frontend** to provide business analysts with actionable insights. It uses a hybrid approach of rule-based logic and GenAI simulation to interpret complex customer behaviors.

## ✨ Key Features included in this project

### 🧠 Backend (Python & FastAPI)
*   **API Architecture**: Modular FastAPI implementation with Pydantic schemas (`api/`).
*   **Machine Learning Model**: Trained Random Forest Classifier for accurate churn probability inference (`ml/inference.py`).
*   **Batch Analytics**: High-performance vectorized prediction for large-scale dashboard analytics.
*   **Customer Database**: Searchable and paginated customer management endpoints.
*   **GenAI Explanation Layer**: Simulates AI reasoning to generate human-readable narratives and business recommendations (`genai/explanation_engine.py`).
*   **Feature Engineering**: robust preprocessing and normalization of customer data (`ml/features.py`).
*   **Observability**: Integrated **OpenTelemetry** tracing and centralized logging (`observability/`).
*   **CORS & Security**: Configured to securely communicate with the frontend dashboard.
*   **Data Generation**: Script to generate realistic synthetic retail data (`data/generate_freshmart_data.py`).

### 💻 Frontend (React + Vite)
*   **Dashboard**: A responsive analytics dashboard (`frontend/src/pages/Dashboard.jsx`).
*   **Customer Database**: Searchable list view with risk filtering (`frontend/src/pages/Customers.jsx`).
*   **Interactive Forms**: `ChurnForm` for inputting customer metrics with validation.
*   **Visualizations**: `PredictionCard` with color-coded risk indicators and confidence scores.
*   **Insight Panels**: `ExplanationPanel` displaying natural language summaries and key risk factors.
*   **Modern Styling**: Built with **Tailwind CSS v4** for a clean, professional UI.
*   **State Management**: React Hooks handling API loading states and error boundaries.

## 📂 Project Structure

```
genai_retention_system/
├── api/                  # FastAPI Application
│   ├── routes/           # API Endpoints (churn.py)
│   ├── main.py           # App Entry Point & Middleware
│   └── schemas.py        # Pydantic Data Models
├── core/                 # Core Config & Setup
├── data/                 # Data Generation Scripts
├── frontend/             # React Application
│   ├── src/
│   │   ├── components/   # UI Components (Forms, Cards)
│   │   ├── pages/        # Route Pages (Dashboard)
│   │   └── services/     # API Client (Axios)
│   └── public/
├── genai/                # GenAI Logic & Reasoning
├── ml/                   # Machine Learning Modules
│   ├── churn_model.py    # Prediction Orchestrator
│   ├── churn_rules.py    # Business Logic Rules
│   ├── features.py       # Data Preprocessing
│   └── explain.py        # Explainability Logic
├── observability/        # Logging & Tracing
└── run.sh                # Backend Startup Script
```

## 🛠️ Technology Stack
*   **Backend**: Python 3.x, FastAPI, Uvicorn, Pydantic, OpenTelemetry
*   **Frontend**: React 18, Vite, Tailwind CSS, Axios
*   **Data**: Pandas (for data generation)

## 🚦 Getting Started

### 1. Start the Backend
```bash
./run.sh
```
*   Server runs at `http://0.0.0.0:8000`
*   Docs available at `http://localhost:8000/docs`

### 2. Start the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*   Dashboard runs at `http://localhost:5173`

---
*Built for the FreshMart Retention Intelligence Initiative.*
