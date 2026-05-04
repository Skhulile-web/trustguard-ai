"""Small in-memory table store for local prototype data."""
from __future__ import annotations

from collections import defaultdict
from typing import Any

_tables: dict[str, list[dict[str, Any]]] = defaultdict(list)


async def insert(table: str, row: dict[str, Any]) -> None:
    _tables[table].append(row)


async def select(table: str, limit: int = 100) -> list[dict[str, Any]]:
    return list(reversed(_tables[table]))[:limit]
