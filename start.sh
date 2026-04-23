#!/usr/bin/env bash
set -euo pipefail

echo "Starting Mongo (docker-compose) ..."
docker compose up -d

echo "Starting ML service (port 8001) ..."
(cd ml-service && source .venv/bin/activate 2>/dev/null || true; uvicorn app.main:app --reload --port 8001) &

echo "Starting backend (port 8000) ..."
(cd backend && npm run dev) &

echo "Starting frontend (port 5173) ..."
(cd frontend && npm run dev) &

echo "All services started."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "ML:       http://localhost:8001"

wait

