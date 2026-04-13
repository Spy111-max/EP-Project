from __future__ import annotations

from typing import Any


def normalize(value: float, min_value: float, max_value: float) -> float:
    if max_value == min_value:
        return 0.0
    return (value - min_value) / (max_value - min_value)


def classify_pollution(pm25: float) -> str:
    if pm25 <= 30:
        return "Good"
    if pm25 <= 60:
        return "Moderate"
    if pm25 <= 90:
        return "Poor"
    if pm25 <= 120:
        return "Very Poor"
    return "Severe"


def urgency_score(zone: dict[str, Any]) -> float:
    profile = zone["pollution"]
    weighted_pollution = (
        0.35 * profile["pm25"]
        + 0.2 * profile["pm10"]
        + 0.2 * profile["nox"]
        + 0.15 * profile["sox"]
        + 0.1 * profile["co2"] / 10
    )

    zone_weight = {
        "industrial": 1.25,
        "traffic": 1.15,
        "residential": 1.0,
        "peri_urban": 0.9,
    }.get(zone["zone_type"], 1.0)

    return round(weighted_pollution * zone_weight, 2)


def enrich_hotspot(zone: dict[str, Any]) -> dict[str, Any]:
    return {
        **zone,
        "urgency_score": urgency_score(zone),
        "pollution_band": classify_pollution(zone["pollution"]["pm25"]),
    }
