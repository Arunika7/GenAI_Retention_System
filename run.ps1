# PowerShell script to run the FreshMart Retention API
$VenvPath = ".\venv\Scripts\Activate.ps1"

if (Test-Path $VenvPath) {
    Write-Host "[INFO] Activating virtual environment..." -ForegroundColor Cyan
    & $VenvPath
} else {
    Write-Warning "[ERROR] Virtual environment not found at .\venv"
    Write-Host "Please create it using: python -m venv venv"
    exit
}

Write-Host "[INFO] Starting FreshMart Customer Retention API..." -ForegroundColor Green
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
