#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"

echo "========================================================"
echo "🛰️  SatQuery AI — Full-Stack Workstation Startup"
echo "========================================================"

# 1. Setup Python Virtual Environment
if [ ! -d "$SERVER_DIR/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$SERVER_DIR/venv"
    source "$SERVER_DIR/venv/bin/activate"
    pip install -r "$SERVER_DIR/requirements.txt"
else
    source "$SERVER_DIR/venv/bin/activate"
fi

# 2. Check Node Modules
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo "Installing frontend dependencies..."
    (cd "$ROOT_DIR" && npm install)
fi

# Kill any existing processes on 8000 or 5173
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Function to clean up child processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down SatQuery AI full-stack servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Start Backend FastAPI Server (Port 8000)
echo "🚀 Starting FastAPI Backend on http://127.0.0.1:8000 ..."
(
    cd "$ROOT_DIR"
    PYTHONPATH="$SERVER_DIR" "$SERVER_DIR/venv/bin/python" "$SERVER_DIR/main.py"
) &
BACKEND_PID=$!

# Wait for backend to come online
echo "⏳ Waiting for backend health check..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
        echo "✅ Backend is ONLINE!"
        break
    fi
    sleep 0.5
done

# 4. Start Frontend Vite Dev Server (Port 5173)
echo "⚡ Starting Vite Frontend on http://localhost:5173 ..."
(
    cd "$ROOT_DIR"
    npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo "✨ SatQuery AI is running live!"
echo "   - Frontend Web App: http://localhost:5173"
echo "   - Backend API Docs: http://127.0.0.1:8000/docs"
echo "   - Health Check:     http://127.0.0.1:8000/api/health"
echo "========================================================"
echo "Press Ctrl+C to stop all servers."

# Wait on background processes
wait
