from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from api.routes.churn import router as churn_router

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
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
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
