"""Orchestrator Service.

Sits between the API Gateway and the Risk Engine. Asks the LangChain agent
which CAMARA APIs to invoke, executes them in parallel, then hands the
collected signals to the Risk Engine.
"""
from __future__ import annotations

import asyncio

from app.ai.agent import decide_apis_to_call
from app.integrations import camara
from app.models import ApiCall, RiskRequest, RiskResult, RiskSignals
from app.risk_engine.engine import evaluate


_LABELS = {
    "number_verification": "CAMARA Number Verification",
    "sim_swap": "CAMARA SIM Swap",
    "device_status": "CAMARA Device Status",
    "kyc_match": "CAMARA KYC Match",
    "location_verification": "CAMARA Location Verify",
}


async def _call_one(name: str, phone: str) -> dict:
    fn = {
        "number_verification": camara.number_verification,
        "sim_swap": camara.sim_swap,
        "device_status": camara.device_status,
        "kyc_match": camara.kyc_match,
        "location_verification": camara.location_verification,
    }[name]
    return await fn(phone)  # type: ignore[arg-type]


async def orchestrate(
    req: RiskRequest,
    override: RiskSignals | None = None,
    api_calls_override: list[ApiCall] | None = None,
) -> RiskResult:
    """Main entrypoint. If `override` is provided, signals come straight from
    the caller (used by the simulator). Otherwise we call the real (mocked)
    CAMARA APIs in parallel and derive signals from their responses."""

    derived = RiskSignals()
    api_calls: list[ApiCall] = api_calls_override or []

    if api_calls_override is None:
        apis_to_call = decide_apis_to_call(req)
        responses = await asyncio.gather(*[_call_one(name, req.phone) for name in apis_to_call])

        for name, res in zip(apis_to_call, responses):
            status = "good"
            if name == "sim_swap" and res.get("swapped"):
                derived.simSwap = True; status = "bad"
            if name == "device_status" and res.get("new_device"):
                derived.deviceChanged = True; status = "warn"
            if name == "kyc_match":
                derived.kycMatch = bool(res.get("match", True))
                if not derived.kycMatch: status = "bad"
            if name == "number_verification":
                derived.numberVerified = bool(res.get("verified", True))
                if not derived.numberVerified: status = "bad"
            if name == "location_verification" and res.get("mismatch"):
                derived.locationMismatch = True; status = "warn"
            api_calls.append(ApiCall(name=_LABELS[name], latencyMs=res["latencyMs"], status=status))  # type: ignore[arg-type]

    signals = override or derived
    return await evaluate(signals, api_calls)
