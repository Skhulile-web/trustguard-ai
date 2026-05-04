# TrustGuard AI

TrustGuard AI is a local React + Vite frontend with a FastAPI backend for
telecom-assisted risk decisioning.

## Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open <http://127.0.0.1:5173/app/simulator>.

## Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open <http://127.0.0.1:8000/docs>.

## Nokia NaC Simulator

The transaction simulator uses the official `network_as_code` Python SDK.
For the free simulator, use your Nokia Network as Code application key and a
simulator phone number such as `+3672123456`.
