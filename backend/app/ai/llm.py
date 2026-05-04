"""Risk explanation generation.

Uses LangChain + Ollama when available, with a deterministic rule-based
fallback so the backend still runs on machines without Ollama installed.
"""
from __future__ import annotations

from app.core.config import settings
from app.models import Decision, RiskFactor


async def explain(score: int, decision: Decision, factors: list[RiskFactor]) -> str:
    prompt = _prompt(score, decision, factors)
    try:
        from langchain_ollama import ChatOllama

        llm = ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_URL,
            temperature=0.1,
        )
        response = await llm.ainvoke(
            [
                (
                    "system",
                    "You write concise fraud-risk explanations for a fintech risk engine.",
                ),
                ("human", prompt),
            ]
        )
        content = getattr(response, "content", "")
        if isinstance(content, str) and content.strip():
            return content.strip()
    except Exception:
        pass

    return _fallback(score, decision, factors)


def _prompt(score: int, decision: Decision, factors: list[RiskFactor]) -> str:
    drivers = [
        f"{factor.label} impact={factor.impact} status={factor.status}"
        for factor in factors
        if factor.impact > 0
    ]
    return (
        f"Decision: {decision}. Score: {score}/100. "
        f"Risk drivers: {drivers or ['no material anomalies']}. "
        "Explain the decision in one sentence and recommend the next action."
    )


def _fallback(score: int, decision: Decision, factors: list[RiskFactor]) -> str:
    drivers = [f.label for f in factors if f.impact > 0]
    if decision == "block":
        return (
            f"BLOCKED at score {score}/100. Strong fraud signals detected: "
            f"{', '.join(drivers)}. Recommend freezing the session and notifying the customer."
        )
    if decision == "step_up":
        return (
            f"Step-up authentication required (score {score}/100). "
            f"Suspicious factors: {', '.join(drivers) or 'minor anomalies'}. "
            "Challenge the user with OTP and biometric verification before approving."
        )
    return (
        f"Approved with low risk score {score}/100. "
        "Telecom and identity signals are consistent with the legitimate account holder."
    )
