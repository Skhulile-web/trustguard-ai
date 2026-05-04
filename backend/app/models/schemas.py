"""Pydantic schemas shared across all backend layers."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Decision = Literal["approve", "step_up", "block"]
ActionType = Literal["login", "send", "withdraw", "loan"]


class RiskSignals(BaseModel):
    simSwap: bool = False
    deviceChanged: bool = False
    kycMatch: bool = True
    locationMismatch: bool = False
    numberVerified: bool = True
    velocityAnomaly: bool = False


class RiskRequest(BaseModel):
    phone: str = Field(..., examples=["+8801712553411"])
    action: ActionType = "withdraw"
    amount: float | None = None
    signals: RiskSignals = RiskSignals()


class NacSimulatorConfig(BaseModel):
    rapidApiKey: str = Field(default="", repr=False)
    customerName: str | None = None
    idDocument: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    radiusMeters: int = 2000
    simSwapMaxAgeHours: int = 72


class NacRiskRequest(RiskRequest):
    nac: NacSimulatorConfig = NacSimulatorConfig()


class RiskFactor(BaseModel):
    label: str
    impact: int
    status: Literal["good", "warn", "bad"]


class ApiCall(BaseModel):
    name: str
    latencyMs: int
    status: Literal["good", "warn", "bad"]


class RiskResult(BaseModel):
    score: int
    decision: Decision
    explanation: str
    factors: list[RiskFactor]
    apisCalled: list[ApiCall]
    timestamp: str


class Transaction(BaseModel):
    id: str
    phone: str
    action: ActionType
    amount: float
    score: int
    decision: Decision
    timestamp: str
