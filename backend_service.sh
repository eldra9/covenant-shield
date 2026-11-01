#!/usr/bin/env bash
# Covenant Shield - Backend Background Runner

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$DIR/backend"
LOG_FILE="$DIR/backend.log"
PID_FILE="$DIR/backend.pid"

case "$1" in
  start)
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
      echo "Backend is already running (PID: $(cat "$PID_FILE")) on port 8000"
      exit 0
    fi
    echo "Starting Covenant Shield backend in background..."
    cd "$BACKEND_DIR"
    nohup .venv/bin/python manage.py runserver 0.0.0.0:8000 > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    sleep 2
    if kill -0 $PID 2>/dev/null; then
      echo "✅ Backend running successfully in background (PID: $PID)"
      echo "   URL: http://localhost:8000"
      echo "   Logs: tail -f $LOG_FILE"
      echo "   Stop: ./backend_service.sh stop"
    else
      echo "❌ Failed to start. Check $LOG_FILE for details."
    fi
    ;;
  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      echo "Stopping backend (PID: $PID)..."
      kill $PID 2>/dev/null
      rm -f "$PID_FILE"
      # Also clean up any lingering runserver on 8000
      fuser -k 8000/tcp 2>/dev/null || true
      echo "✅ Backend stopped."
    else
      fuser -k 8000/tcp 2>/dev/null || true
      echo "Backend was not running or PID file missing."
    fi
    ;;
  status)
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
      echo "✅ Backend is running (PID: $(cat "$PID_FILE")) on port 8000"
    elif fuser 8000/tcp 2>/dev/null; then
      echo "⚠️ Port 8000 is active (process running)"
    else
      echo "Backend is stopped"
    fi
    ;;
  logs)
    tail -f "$LOG_FILE"
    ;;
  *)
    echo "Usage: ./backend_service.sh {start|stop|status|logs}"
    ;;
esac
