@echo off
echo Starting Backend...
start "F1 Simulator Backend" python backend/app.py

echo Starting Frontend...
cd frontend
start "F1 Simulator Frontend" npm run dev

echo Simulator is starting! Access it at http://localhost:5173
pause
