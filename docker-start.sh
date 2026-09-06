#!/bin/bash
# Container entrypoint for free hosting (Render).
# Starts worker (3030) and trace WS (3003) internally; the Next.js
# production build serves the publicly exposed $PORT.

set -e

PORT="${PORT:-3000}"
export DATABASE_URL="${DATABASE_URL:-file:../db/custom.db}"

# Safety net: recreate + seed the database if it is missing (ephemeral hosts).
if [ ! -f db/custom.db ]; then
  echo "[start] db/custom.db missing - pushing schema and seeding dataset..."
  npx prisma db push --accept-data-loss
  python3 scripts/seed_db.py
fi

# The worker calls back into the dashboard's AI routes; point it at the
# internal port the dashboard is actually bound to.
export APFRAUD_LLM_URL="http://127.0.0.1:${PORT}/api/ai/llm"
export APFRAUD_TTS_URL="http://127.0.0.1:${PORT}/api/ai/tts"
export APFRAUD_ASR_URL="http://127.0.0.1:${PORT}/api/ai/asr"
export WORKER_URL="http://127.0.0.1:3030"

echo "[start] launching pipeline worker on 3030..."
python3 worker/main.py &

echo "[start] launching trace service on 3003..."
node mini-services/pipeline-ws/index.js &

echo "[start] launching dashboard on port ${PORT}..."
exec npx next start -p "$PORT"
