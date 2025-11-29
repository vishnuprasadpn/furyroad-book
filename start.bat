@echo off
REM FuryRoad RC Club - Start Script (Windows)
REM Starts both backend and frontend servers

echo.
echo 🚀 Starting FuryRoad RC Club Application...
echo.

REM Check if .env files exist
if not exist "backend\.env" (
    echo ⚠️  Warning: backend\.env not found!
    echo    Please copy backend\.env.example to backend\.env and configure it.
    echo.
)

if not exist "frontend\.env" (
    echo ℹ️  Info: frontend\.env not found (optional - will use auto-detection)
    echo.
)

REM Check if node_modules exist
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    call npm install
    echo.
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

echo ✅ Starting servers...
echo    Backend:  http://localhost:5001
echo    Frontend: http://localhost:3000 (or Vite's default port)
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
call npm run dev

