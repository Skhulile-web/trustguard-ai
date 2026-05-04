"""TrustGuard AI FastAPI entrypoint."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api_gateway.router import router as gateway_router
from app.core.config import settings

app = FastAPI(
    title="TrustGuard AI",
    description="AI-powered fraud prevention and digital trust orchestration",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gateway_router)


@app.get("/", tags=["meta"])
def root() -> dict:
    return {
        "service": "trustguard-ai",
        "version": app.version,
        "docs": "/docs",
    }


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}
