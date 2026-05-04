# TrustGuard AI Backend

FastAPI service for TrustGuard AI risk decisioning.

## Run

```bash
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open <http://127.0.0.1:8000/docs>.

## Main Flow

```text
Frontend request
  -> API Gateway
  -> Nokia Network as Code simulator checks
     -> SIM Swap
     -> KYC Match
     -> Location Verification
  -> Risk Engine
  -> Ollama/LangChain explanation with rule-based fallback
  -> Audit, transaction, and notification stores
```

The Nokia simulator endpoint is `POST /api/risk/nac-simulate`. It requires a
Network as Code application key and a free simulator phone number such as
`+3672123456`.
