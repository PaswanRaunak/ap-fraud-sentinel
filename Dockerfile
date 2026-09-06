# AP Payment Fraud Sentinel - all-in-one container for free hosting (Render).
# Runs the Next.js dashboard, the Python pipeline worker, and the socket.io
# trace service as one service; the dashboard is the only publicly exposed port.

FROM node:20-bookworm-slim

# Python 3 for the pipeline worker.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Dependencies first (better layer caching) ---
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY mini-services/pipeline-ws/package.json mini-services/pipeline-ws/
RUN cd mini-services/pipeline-ws && npm install --no-audit --no-fund

COPY worker/requirements.txt worker/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r worker/requirements.txt

# --- App source ---
COPY . .

ENV DATABASE_URL=file:../db/custom.db \
    NEXT_TELEMETRY_DISABLED=1

# Prisma client + schema + seeded demo dataset baked into the image.
RUN npx prisma generate \
    && npx prisma db push --accept-data-loss \
    && python3 scripts/seed_db.py

ENV NODE_ENV=production
RUN npm run build

COPY docker-start.sh /app/docker-start.sh
RUN chmod +x /app/docker-start.sh

EXPOSE 3000

CMD ["bash", "docker-start.sh"]
