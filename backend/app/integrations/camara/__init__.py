"""Nokia Network as Code integration helpers."""
from __future__ import annotations

import asyncio
import random
import time
from typing import Any

from fastapi import HTTPException

from app.models import NacSimulatorConfig


async def _simulated_call(
    name: str,
    payload: dict[str, Any],
    min_ms: int,
    max_ms: int,
) -> dict[str, Any]:
    latency = random.randint(min_ms, max_ms)
    await asyncio.sleep(latency / 1000)
    return {"api": name, "latencyMs": latency, "payload": payload}


async def sim_swap(phone: str) -> dict[str, Any]:
    res = await _simulated_call("sim_swap", {"phone": phone}, 80, 140)
    res["swapped"] = random.random() < 0.18
    return res


async def device_status(phone: str) -> dict[str, Any]:
    res = await _simulated_call("device_status", {"phone": phone}, 70, 120)
    res["new_device"] = random.random() < 0.30
    return res


async def kyc_match(phone: str, name: str | None = None) -> dict[str, Any]:
    res = await _simulated_call("kyc_match", {"phone": phone, "name": name}, 90, 160)
    res["match"] = random.random() > 0.05
    return res


async def number_verification(phone: str) -> dict[str, Any]:
    res = await _simulated_call("number_verification", {"phone": phone}, 60, 110)
    res["verified"] = random.random() > 0.03
    return res


async def location_verification(
    phone: str,
    geo: tuple[float, float] | None = None,
) -> dict[str, Any]:
    res = await _simulated_call("location_verification", {"phone": phone, "geo": geo}, 100, 180)
    res["mismatch"] = random.random() < 0.12
    return res


async def nac_kyc_match(phone: str, config: NacSimulatorConfig) -> dict[str, Any]:
    return await asyncio.to_thread(_sdk_kyc_match, phone, config)


async def nac_location_verification(phone: str, config: NacSimulatorConfig) -> dict[str, Any]:
    return await asyncio.to_thread(_sdk_location_verification, phone, config)


async def nac_sim_swap(phone: str, config: NacSimulatorConfig) -> dict[str, Any]:
    return await asyncio.to_thread(_sdk_sim_swap, phone, config)


def _sdk_client(config: NacSimulatorConfig) -> Any:
    try:
        import network_as_code as nac
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="The Network as Code SDK is not installed in the backend environment.",
        ) from exc

    try:
        return nac.NetworkAsCodeClient(token=config.rapidApiKey)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not create Nokia Network as Code client: {exc}",
        ) from exc


def _sdk_device(phone: str, config: NacSimulatorConfig) -> Any:
    client = _sdk_client(config)
    try:
        if "@" in phone:
            return client.devices.get(network_access_identifier=phone)
        return client.devices.get(phone_number=phone)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not create Nokia NaC simulator device: {exc}",
        ) from exc


def _sdk_kyc_match(phone: str, config: NacSimulatorConfig) -> dict[str, Any]:
    client = _sdk_client(config)
    started = time.perf_counter()
    try:
        result = client.kyc.match_customer(
            phone_number=phone,
            name=config.customerName,
            id_document=config.idDocument,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Nokia NaC KYC Match simulator failed: {exc}",
        ) from exc

    latency_ms = int((time.perf_counter() - started) * 1000)
    data = _to_plain_data(result)
    return {
        "api": "nac_kyc_match",
        "latencyMs": latency_ms,
        "payload": {"device": phone, "name": config.customerName},
        "data": data,
        "match": _infer_kyc_match(data),
    }


def _sdk_location_verification(phone: str, config: NacSimulatorConfig) -> dict[str, Any]:
    if config.latitude is None or config.longitude is None:
        raise HTTPException(
            status_code=400,
            detail="Latitude and longitude are required for Nokia NaC Location Verification.",
        )

    device = _sdk_device(phone, config)
    started = time.perf_counter()
    try:
        result = device.verify_location(
            latitude=config.latitude,
            longitude=config.longitude,
            radius=config.radiusMeters,
            max_age=max_age_seconds,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Nokia NaC Location Verification simulator failed: {exc}",
        ) from exc

    latency_ms = int((time.perf_counter() - started) * 1000)
    data = _to_plain_data(result)
    verified = _infer_location_verified(data)
    return {
        "api": "nac_location_verification",
        "latencyMs": latency_ms,
        "payload": {
            "device": phone,
            "latitude": config.latitude,
            "longitude": config.longitude,
            "radiusMeters": config.radiusMeters,
        },
        "data": data,
        "mismatch": not verified,
    }


def _sdk_sim_swap(phone: str, config: NacSimulatorConfig) -> dict[str, Any]:
    device = _sdk_device(phone, config)
    max_age_seconds = max(1, config.simSwapMaxAgeHours) * 3600,2400
    started = time.perf_counter()
    try:
        swapped = bool(device.verify_sim_swap(max_age=max_age_seconds))
        swap_date = device.get_sim_swap_date()
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Nokia NaC SIM Swap simulator failed: {exc}",
        ) from exc

    latency_ms = int((time.perf_counter() - started) * 1000)
    return {
        "api": "nac_sim_swap",
        "latencyMs": latency_ms,
        "payload": {
            "device": phone,
            "maxAgeHours": config.simSwapMaxAgeHours,
        },
        "data": {
            "swapped": swapped,
            "lastSwapDate": swap_date.isoformat() if swap_date else None,
        },
        "swapped": swapped,
    }


def _to_plain_data(value: Any) -> Any:
    if hasattr(value, "model_dump"):
        return value.model_dump()
    if hasattr(value, "dict"):
        return value.dict()
    if hasattr(value, "__dict__"):
        return {
            key: nested
            for key, nested in vars(value).items()
            if not key.startswith("_")
        }
    return value


def _infer_kyc_match(data: Any) -> bool:
    explicit = _find_bool(
        data,
        {
            "match",
            "matched",
            "kycmatch",
            "namematch",
            "name_match",
            "identitymatch",
            "verified",
        },
    )
    if explicit is not None:
        return explicit

    score = _find_number(data, {"matchscore", "namematchscore", "name_match_score"})
    if score is not None:
        return score >= 80

    status = _find_text(data, {"status", "result", "matchstatus", "verificationresult"})
    if status:
        normalized = status.lower().replace("_", "").replace("-", "")
        if normalized in {"match", "matched", "true", "verified", "success", "yes"}:
            return True
        if normalized in {"nomatch", "notmatched", "false", "failed", "no"}:
            return False

    return True


def _infer_location_verified(data: Any) -> bool:
    explicit = _find_bool(
        data,
        {"match", "matched", "locationmatch", "verified", "withinarea", "inside"},
    )
    if explicit is not None:
        return explicit

    status = _find_text(data, {"result_type", "resulttype", "status", "result", "verificationresult"})
    if status:
        normalized = status.lower().replace("_", "").replace("-", "")
        if normalized in {"true", "verified", "inside", "withinarea", "match", "matched", "success", "yes"}:
            return True
        if normalized in {"false", "outside", "mismatch", "nomatch", "failed", "no"}:
            return False

    return True


def _find_bool(data: Any, wanted_keys: set[str]) -> bool | None:
    if isinstance(data, dict):
        for key, value in data.items():
            normalized = str(key).lower().replace("_", "").replace("-", "")
            if normalized in wanted_keys and isinstance(value, bool):
                return value
            nested = _find_bool(value, wanted_keys)
            if nested is not None:
                return nested
    if isinstance(data, list):
        for item in data:
            nested = _find_bool(item, wanted_keys)
            if nested is not None:
                return nested
    return None


def _find_number(data: Any, wanted_keys: set[str]) -> float | None:
    if isinstance(data, dict):
        for key, value in data.items():
            normalized = str(key).lower().replace("_", "").replace("-", "")
            if normalized in wanted_keys and isinstance(value, int | float):
                return float(value)
            nested = _find_number(value, wanted_keys)
            if nested is not None:
                return nested
    if isinstance(data, list):
        for item in data:
            nested = _find_number(item, wanted_keys)
            if nested is not None:
                return nested
    return None


def _find_text(data: Any, wanted_keys: set[str]) -> str | None:
    if isinstance(data, dict):
        for key, value in data.items():
            normalized = str(key).lower().replace("_", "").replace("-", "")
            if normalized in wanted_keys and isinstance(value, str):
                return value
            nested = _find_text(value, wanted_keys)
            if nested:
                return nested
    if isinstance(data, list):
        for item in data:
            nested = _find_text(item, wanted_keys)
            if nested:
                return nested
    return None
