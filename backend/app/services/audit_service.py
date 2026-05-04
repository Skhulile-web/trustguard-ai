"""Audit and log service for the immutable compliance trail."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.data import postgres


async def log(event: str, actor: str, details: dict[str, Any]) -> None:
    await postgres.insert(
        "audit_log",
        {
            "event": event,
            "actor": actor,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def recent(limit: int = 100) -> list[dict]:
    return await postgres.select("audit_log", limit=limit)
