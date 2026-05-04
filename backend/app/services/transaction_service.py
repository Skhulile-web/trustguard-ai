"""Transaction service for actions and risk decisions."""
from __future__ import annotations

from app.data import postgres
from app.models import Transaction


async def record(tx: Transaction) -> None:
    await postgres.insert("transactions", tx.model_dump())


async def list_recent(limit: int = 50) -> list[dict]:
    return await postgres.select("transactions", limit=limit)
