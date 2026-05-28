@echo off
echo.
echo  =============================================
echo   AegisRoad v3.0 - Starting All Services
echo  =============================================
echo.

echo [1/3] Starting FastAPI Backend on port 8000...
start cmd /k "cd backend && pip install -r requirements.txt --quiet && uvicorn main:app --reload"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Frontend + Mock Server...
start cmd /k "cd frontend && npm install && npm run dev"

timeout /t 3 /nobreak > nul

echo [3/3] Opening browser...
timeout /t 5 /nobreak > nul
start http://localhost:5173

echo.
echo  =============================================
echo   AegisRoad is running!
echo   Frontend  → http://localhost:5173
echo   Backend   → http://localhost:8000
echo   API Docs  → http://localhost:8000/docs
echo   Mock Data → http://localhost:3001
echo  =============================================
echo.
pause