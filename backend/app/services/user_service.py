"""User service for prototype profiles, preferences, and devices."""
from __future__ import annotations

from app.data import postgres

_demo_users = [
    {"id": "u_001", "phone": "+8801712553411", "name": "Ayesha Rahman", "tier": "gold", "devices": 2},
    {"id": "u_002", "phone": "+8801911223344", "name": "Karim Hossain", "tier": "silver", "devices": 1},
    {"id": "u_003", "phone": "+8801555667788", "name": "Nadia Islam", "tier": "platinum", "devices": 3},
    {"id": "u_004", "phone": "+8801799001122", "name": "Tanvir Ahmed", "tier": "silver", "devices": 1},
]


async def list_users() -> list[dict]:
    extra = await postgres.select("users")
    return _demo_users + extra
