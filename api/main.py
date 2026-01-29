from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from api.routes.churn import router as churn_router
from core.tracing import setup_tracing

# Initialize Tracing
setup_tracing()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FreshMart Customer Retention API",
    description="API for predicting customer churn and recommending retention actions",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Tracing initialized.")
    logger.info("FreshMart Customer Retention API started")

@app.get("/")
async def root():
    return {
        "message": "Welcome to FreshMart Customer Retention API",
        "version": "1.0.0"
    }

# Register churn routes
app.include_router(
    churn_router,
    prefix="/api/churn",
    tags=["Churn"]
)
