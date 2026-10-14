FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
<<<<<<< HEAD
RUN npm ci
=======
RUN npm ci || npm install
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13


COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000 \
    HOST=0.0.0.0 \
    PYTHONPATH=/app

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ /app/backend/
COPY analytics/ /app/analytics/
COPY ai_workflows/ /app/ai_workflows/
COPY mcp_server/ /app/mcp_server/
COPY data/ /app/data/
COPY sample.csv /app/sample.csv

COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

RUN mkdir -p /app/data

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
<<<<<<< HEAD
  CMD-SHELL curl -f "http://localhost:${PORT:-5000}/api/operations/health" || exit 1

CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 2 --threads 4 --timeout 120 backend.app:app"]
=======
  CMD curl -f http://localhost:5000/api/operations/health || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "--timeout", "120", "backend.app:app"]
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13
