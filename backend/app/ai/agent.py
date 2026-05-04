"""Deterministic API selection for the mocked orchestration path."""
from __future__ import annotations

from app.models import RiskRequest


def decide_apis_to_call(req: RiskRequest) -> list[str]:
    """Return the CAMARA API names the generic orchestrator should invoke."""
    base = ["number_verification", "sim_swap", "device_status", "kyc_match"]
    if req.action in ("withdraw", "loan") or (req.amount and req.amount >= 10_000):
        base.append("location_verification")
    return base
