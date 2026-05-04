"""Notification service backed by the local in-memory event store."""
from __future__ import annotations

from app.data import postgres
from app.models import RiskResult


async def notify(phone: str, result: RiskResult) -> None:
    if result.decision == "approve":
        return
    event = {
        "channel": "sms" if result.decision == "step_up" else "email+sms",
        "phone": phone,
        "decision": result.decision,
        "score": result.score,
        "message": result.explanation,
    }
    await postgres.insert("notifications", event)
