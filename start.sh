#!/bin/bash

# FuryRoad RC Club - Start Script
# Starts both backend and frontend servers

echo "🚀 Starting FuryRoad RC Club Application..."
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found!"
    echo "   Please copy backend/.env.example to backend/.env and configure it."
    echo ""
fi

if [ ! -f "frontend/.env" ]; then
    echo "ℹ️  Info: frontend/.env not found (optional - will use auto-detection)"
    echo ""
fi

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
    echo ""
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo ""
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo ""
fi

echo "✅ Starting servers..."
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:3000 (or Vite's default port)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev

