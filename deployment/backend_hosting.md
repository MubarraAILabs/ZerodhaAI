<<<<<<< HEAD
# Deployment Guide (Railway / Render / Docker)
=======
# Backend Hosting Guide (Render / Railway / Docker)
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13

## 1. Local Verification
```bash
pip install -r backend/requirements.txt
python backend/app.py
```

<<<<<<< HEAD
## 2. Deploy on Railway

The root [Dockerfile](../Dockerfile) builds the Vite frontend and serves it from
the Flask/Gunicorn backend in one Railway service. `railway.json` selects this
Dockerfile, configures the health check, and sets a restart policy.

1. Push the project to a GitHub repository.
2. In Railway, create a project and choose **Deploy from GitHub repo**. Select
   this repository and leave the service root directory at the repository root.
3. Add a **PostgreSQL** service to the Railway project. In the app service's
   variables, set `DATABASE_URL` to the PostgreSQL service's `DATABASE_URL`
   reference (commonly `${{Postgres.DATABASE_URL}}`; use the exact service name
   shown in your project). The app creates its tables on startup.
4. Add these variables to the app service:
   - `JWT_SECRET_KEY`: a unique, random secret; generate one locally with
     `python -c "import secrets; print(secrets.token_hex(32))"`.
   - `GEMINI_API_KEY`: your Google AI Studio key, if you want AI-generated insights.
5. Deploy. Once the health check succeeds, open the generated Railway domain.
   The same domain serves both the frontend and `/api/*`; do not set `VITE_API_URL`.
6. In Railway's **Networking** settings, generate a public domain if one was not
   created automatically.

Railway's `PORT` is used by the container at runtime. The PostgreSQL service is
recommended for persistent users, portfolios, and audit logs. If PostgreSQL is
not configured or cannot be reached, the app falls back to SQLite in `/app/data`;
SQLite data requires a Railway volume mounted at `/app/data` and is less suitable
for production or multiple replicas.

## 3. Deploy on Render
1. Create a **New Web Service** linked to your GitHub repo.
2. Settings:
   - **Runtime**: Docker
   - **Dockerfile Path**: `Dockerfile`
3. Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `DATABASE_URL` or `NEON_DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET_KEY`: Production secret string

## 4. Deploy with Docker
=======
## 2. Deploy on Render
1. Create a **New Web Service** linked to your GitHub repo.
2. Settings:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn backend.app:app --bind 0.0.0.0:$PORT` (or `python backend/app.py`)
3. Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `NEON_DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET_KEY`: Production secret string

## 3. Deploy with Docker
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13
```bash
# Build unified image
docker build -t zerodha-ai-platform .

# Run container (frontend + backend unified on port 5000)
docker run -d -p 5000:5000 --env-file .env --name zerodha-app zerodha-ai-platform
```
