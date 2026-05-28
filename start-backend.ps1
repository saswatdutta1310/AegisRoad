# Start AegisRoad FastAPI backend (port 8000)
Set-Location $PSScriptRoot\backend
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created backend/.env from example — add ANTHROPIC_API_KEY for live chat."
}
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
