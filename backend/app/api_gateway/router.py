"""API Gateway: auth, rate-limit, request validation, routing.

This is the single entrypoint exposed by `main.py`. It wires every
downstream service (Orchestrator, User, Transaction, Audit, Notification).
"""
from __future__ import annotations

import asyncio
import json
import random
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.core.rate_limit import rate_limit
from app.core.security import require_auth
from app.integrations import camara
from app.models import ApiCall, NacRiskRequest, RiskRequest, RiskResult, RiskSignals, Transaction
from app.orchestrator.service import orchestrate
from app.services import audit_service, notification_service, transaction_service, user_service

router = APIRouter(prefix="/api", dependencies=[Depends(rate_limit)])


# ---- Risk decisioning ----------------------------------------------------

@router.post("/risk/score", response_model=RiskResult, tags=["risk"])
async def risk_score(req: RiskRequest, user=Depends(require_auth)) -> RiskResult:
    """Synchronous scoring using the signals provided by the caller."""
    result = await orchestrate(req, override=req.signals)
    await _record_decision(req, result, user)
    return result


@router.post("/risk/simulate", response_model=RiskResult, tags=["risk"])
async def risk_simulate(req: RiskRequest, user=Depends(require_auth)) -> RiskResult:
    """Full orchestration path with mocked CAMARA fan-out."""
    result = await orchestrate(req)
    await _record_decision(req, result, user)
    return result


@router.post("/risk/nac-simulate", response_model=RiskResult, tags=["risk"])
async def risk_nac_simulate(req: NacRiskRequest, user=Depends(require_auth)) -> RiskResult:
    """Score using Nokia NaC KYC, Location Verification, and SIM Swap simulator calls."""
    _validate_nac_config(req)

    kyc, location, sim_swap = await asyncio.gather(
        camara.nac_kyc_match(req.phone, req.nac),
        camara.nac_location_verification(req.phone, req.nac),
        camara.nac_sim_swap(req.phone, req.nac),
    )
    signals = RiskSignals(
        simSwap=bool(sim_swap.get("swapped", False)),
        kycMatch=bool(kyc.get("match", True)),
        locationMismatch=bool(location.get("mismatch", False)),
        velocityAnomaly=_is_velocity_anomaly(req),
    )
    api_calls = [
        ApiCall(
            name="Nokia NaC SIM Swap",
            latencyMs=int(sim_swap.get("latencyMs", 0)),
            status="bad" if signals.simSwap else "good",
        ),
        ApiCall(
            name="Nokia NaC KYC Match",
            latencyMs=int(kyc.get("latencyMs", 0)),
            status="good" if signals.kycMatch else "bad",
        ),
        ApiCall(
            name="Nokia NaC Location Verification",
            latencyMs=int(location.get("latencyMs", 0)),
            status="good" if not signals.locationMismatch else "warn",
        ),
    ]
    result = await orchestrate(req, override=signals, api_calls_override=api_calls)
    await _record_decision(req, result, user)
    return result


def _validate_nac_config(req: NacRiskRequest) -> None:
    missing = []
    if not req.nac.rapidApiKey.strip():
        missing.append("Network as Code application key")
    if not req.nac.customerName or not req.nac.customerName.strip():
        missing.append("Customer name")
    if req.nac.latitude is None:
        missing.append("Latitude")
    if req.nac.longitude is None:
        missing.append("Longitude")

    if missing:
        raise HTTPException(
            status_code=400,
            detail=(
                "Nokia NaC API information is required before risk analysis can run. "
                f"Missing: {', '.join(missing)}."
            ),
        )

    if not _is_nac_simulator_device(req.phone):
        raise HTTPException(
            status_code=400,
            detail=(
                "Free Nokia NaC simulator mode requires a simulator device identifier. "
                "For KYC Match, use a simulator phone number starting with +3672, "
                "+3670, or 3637."
            ),
        )


def _is_nac_simulator_device(value: str) -> bool:
    normalized = value.strip().lower()
    return (
        normalized.startswith("+3672")
        or normalized.startswith("+3670")
        or normalized.startswith("3637")
    )


def _is_velocity_anomaly(req: RiskRequest) -> bool:
    amount = req.amount or 0
    return (req.action in {"send", "withdraw"} and amount >= 50000) or (
        req.action == "loan" and amount >= 25000
    )


async def _record_decision(req: RiskRequest, result: RiskResult, user: dict) -> None:
    tx = Transaction(
        id=f"tx_{int(time.time()*1000)}",
        phone=req.phone,
        action=req.action,
        amount=req.amount or 0,
        score=result.score,
        decision=result.decision,
        timestamp=result.timestamp,
    )
    await asyncio.gather(
        transaction_service.record(tx),
        notification_service.notify(req.phone, result),
        audit_service.log("risk.decision", user.get("sub", "anon"),
                          {"phone": req.phone, "decision": result.decision, "score": result.score}),
    )


# ---- Users ---------------------------------------------------------------

@router.get("/users", tags=["users"])
async def users(_=Depends(require_auth)) -> list[dict]:
    return await user_service.list_users()


# ---- Transactions / Trust Timeline --------------------------------------

@router.get("/transactions", tags=["transactions"])
async def transactions(limit: int = 50, _=Depends(require_auth)) -> list[dict]:
    return await transaction_service.list_recent(limit)


# ---- Audit log -----------------------------------------------------------

@router.get("/audit", tags=["audit"])
async def audit(limit: int = 100, _=Depends(require_auth)) -> list[dict]:
    return await audit_service.recent(limit)


# ---- AI Insights ---------------------------------------------------------

@router.get("/insights", tags=["ai"])
async def insights() -> list[dict]:
    return [
        {"id": "1", "severity": "high",
         "title": "SIM swap fraud cluster detected in Chittagong",
         "summary": "12 SIM swap events tied to 4 mule accounts in the last 6 hours.",
         "factors": ["SIM Swap velocity", "New device", "High-value withdrawals"]},
        {"id": "2", "severity": "medium",
         "title": "Step-up friction increasing for legitimate users",
         "summary": "Approve-after-stepup rate dropped 6% week-over-week.",
         "factors": ["Operator: Robi", "KYC fuzzy match"]},
        {"id": "3", "severity": "low",
         "title": "Device fingerprint coverage at 94.2%",
         "summary": "5.8% of sessions lack a stable device identifier.",
         "factors": ["Device fingerprint", "Android"]},
    ]


# ---- Live SSE stream (Fraud Alert Pulse) ---------------------------------

@router.get("/transactions/stream", tags=["transactions"])
async def stream_transactions():
    async def event_gen():
        actions = ["login", "send", "withdraw", "loan"]
        while True:
            req = RiskRequest(
                phone=f"+88017{random.randint(10000000, 99999999)}",
                action=random.choice(actions),
                amount=random.choice([1200, 5400, 12400, 25000, 50000]),
                signals=RiskSignals(
                    simSwap=random.random() < 0.15,
                    deviceChanged=random.random() < 0.25,
                    kycMatch=random.random() > 0.05,
                    locationMismatch=random.random() < 0.1,
                    numberVerified=random.random() > 0.03,
                    velocityAnomaly=random.random() < 0.12,
                ),
            )
            result = await orchestrate(req, override=req.signals)
            payload = {
                "id": f"tx_{int(time.time()*1000)}",
                "action": req.action, "amount": req.amount, "phone": req.phone,
                "score": result.score, "decision": result.decision,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(random.uniform(1.2, 2.8))

    return StreamingResponse(event_gen(), media_type="text/event-stream")
