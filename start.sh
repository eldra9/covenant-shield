#!/usr/bin/env bash
# Covenant Shield - Unified Launcher

trap 'kill $(jobs -p) 2>/dev/null' EXIT INT TERM

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================================="
echo "🛡️  Starting Covenant Shield Services"
echo "=================================================="

# 1. Start Backend API on port 8000
echo "➡️  [1/3] Launching Django Backend on http://localhost:8000 ..."
cd "$ROOT_DIR/backend"
.venv/bin/python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# 2. Start Public Website on port 3000
echo "➡️  [2/3] Launching Public Website on http://localhost:3000 ..."
cd "$ROOT_DIR/Public website"
npm run dev &
PUBLIC_PID=$!

# 3. Start Client Portal on port 3001
echo "➡️  [3/4] Launching Client Portal on http://localhost:3001 ..."
cd "$ROOT_DIR/client portal"
npm run dev &
CLIENT_PID=$!

# 4. Start Admin Portal on port 3002
echo "➡️  [4/4] Launching Admin Portal on http://localhost:3002 ..."
cd "$ROOT_DIR/Admin portal"
npm run dev &
ADMIN_PID=$!

echo ""
echo "✅ All services launched!"
echo "   - Public Website: http://localhost:3000"
echo "   - Client Portal:  http://localhost:3001"
echo "   - Admin Portal:   http://localhost:3002"
echo "   - Django API:     http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers."
echo "=================================================="

wait
