"""Risk engine for signal aggregation, scoring, and explanations."""
from __future__ import annotations

from datetime import datetime, timezone

from app.ai.llm import explain
from app.models import ApiCall, Decision, RiskFactor, RiskResult, RiskSignals


def _factors(signals: RiskSignals) -> list[RiskFactor]:
    return [
        RiskFactor(label="Recent SIM swap (<72h)", impact=45 if signals.simSwap else 0,
                   status="bad" if signals.simSwap else "good"),
        RiskFactor(label="New / unrecognised device", impact=20 if signals.deviceChanged else 0,
                   status="warn" if signals.deviceChanged else "good"),
        RiskFactor(label="KYC to SIM owner mismatch", impact=0 if signals.kycMatch else 25,
                   status="good" if signals.kycMatch else "bad"),
        RiskFactor(label="Location mismatch (cell vs GPS)", impact=15 if signals.locationMismatch else 0,
                   status="warn" if signals.locationMismatch else "good"),
        RiskFactor(label="Number verification failed", impact=0 if signals.numberVerified else 18,
                   status="good" if signals.numberVerified else "bad"),
        RiskFactor(label="Velocity / behavioural anomaly", impact=12 if signals.velocityAnomaly else 0,
                   status="warn" if signals.velocityAnomaly else "good"),
    ]


def _decide(score: int) -> Decision:
    if score >= 60:
        return "block"
    if score >= 30:
        return "step_up"
    return "approve"


async def evaluate(signals: RiskSignals, api_calls: list[ApiCall]) -> RiskResult:
    factors = _factors(signals)
    score = min(100, sum(f.impact for f in factors))
    decision = _decide(score)
    return RiskResult(
        score=score,
        decision=decision,
        explanation=await explain(score, decision, factors),
        factors=factors,
        apisCalled=api_calls,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
