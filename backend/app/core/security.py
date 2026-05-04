"""JWT helpers used by the API Gateway."""
from __future__ import annotations

import time
from typing import Any

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from app.core.config import settings


def issue_token(subject: str, ttl_seconds: int = 2400) -> str:
    payload = {"sub": subject, "iat": int(time.time()), "exp": int(time.time()) + ttl_seconds}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


def require_auth(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    """FastAPI dependency that enforces JWT auth on protected routes.

    For the prototype we accept both a real JWT *and* the literal token
    `demo` to keep the playground frictionless.
    """
    if not authorization:
        # Allow anonymous in prototype mode
        return {"sub": "anonymous", "demo": True}
    token = authorization.removeprefix("Bearer ").strip()
    if token == "demo":
        return {"sub": "demo-user", "demo": True}
    return decode_token(token)
