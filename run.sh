#!/bin/bash

# Configuration
VENV_DIR="venv"
APP_MODULE="api.main:app"
HOST="0.0.0.0"
PORT="8000"

echo "=================================================="
echo "   FreshMart GenAI Customer Retention System"
echo "=================================================="

# Check and activate virtual environment
if [ -d "$VENV_DIR" ]; then
    echo "[INFO] Activating virtual environment..."
    # Support for both standard venv and Windows Git Bash paths
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
    elif [ -f "$VENV_DIR/Scripts/activate" ]; then
         source "$VENV_DIR/Scripts/activate"
    else
        echo "[ERROR] Activation script not found in $VENV_DIR"
        exit 1
    fi
else
    echo "[ERROR] Virtual environment '$VENV_DIR' not found!"
    echo "       Please create it first using: python -m venv $VENV_DIR"
    exit 1
fi

# Set PYTHONPATH to current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)
echo "[INFO] PYTHONPATH set to: $(pwd)"

# Start FastAPI server
echo "[INFO] Starting FastAPI server..."
echo "       Host: $HOST"
echo "       Port: $PORT"
echo "       Mode: Reload enabled"
echo "--------------------------------------------------"

# Run uvicorn
exec uvicorn "$APP_MODULE" --host "$HOST" --port "$PORT" --reload
