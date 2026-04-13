from __future__ import annotations

import os
from typing import Any

import requests

from psas.constants import ENRICHED_DATA_DIR
from psas.data_sources.json_store import load_json_file, load_optional_json_file


def _site_class_for_zone(zone_type: str | None) -> str:
    if zone_type in {"industrial", "traffic"}:
        return "dense"
    if zone_type == "residential":
        return "balanced"
    return "open"


def _normalize_hotspot(zone: dict[str, Any]) -> dict[str, Any]:
    pollution = zone.get("pollution", {})
    latitude = zone.get("latitude", zone.get("lat"))
    longitude = zone.get("longitude", zone.get("lon"))
    zone_type = zone.get("zone_type", "residential")

    return {
        **zone,
        "zone_id": zone.get("zone_id", zone.get("id")),
        "aqi": pollution,
        "site_class": zone.get("site_class", _site_class_for_zone(zone_type)),
        "latitude": latitude,
        "longitude": longitude,
        "lat": latitude,
        "lon": longitude,
    }


def get_hotspots() -> list[dict[str, Any]]:
    enriched = load_optional_json_file("enriched/hotspots_micro.json")
    source = enriched if enriched else load_json_file("hotspots.json")
    return [_normalize_hotspot(zone) for zone in source]


def get_live_openaq(limit: int = 20) -> list[dict[str, Any]]:
    endpoint = os.getenv("OPENAQ_ENDPOINT", "https://api.openaq.org/v3/locations")
    api_key = os.getenv("OPENAQ_API_KEY")

    headers = {}
    if api_key:
        headers["X-API-Key"] = api_key

    response = requests.get(endpoint, headers=headers, timeout=8)
    response.raise_for_status()
    payload = response.json()

    records = []
    for item in payload.get("results", [])[:limit]:
        coords = item.get("coordinates") or {}
        records.append(
            {
                "id": f"openaq-{item.get('id')}",
                "zone_id": f"openaq-{item.get('id')}",
                "name": item.get("name", "OpenAQ Location"),
                "city": item.get("city") or item.get("locality") or "Unknown",
                "country": item.get("country", "N/A"),
                "lat": coords.get("latitude"),
                "lon": coords.get("longitude"),
                "latitude": coords.get("latitude"),
                "longitude": coords.get("longitude"),
                "zone_type": "traffic",
                "pollution": {
                    "pm25": 65,
                    "pm10": 110,
                    "nox": 75,
                    "sox": 50,
                    "co2": 560,
                },
                "environment": {
                    "soil": "alluvial",
                    "rainfall_mm": 950,
                    "temperature_c": 27,
                },
                "aqi": {
                    "pm25": 65,
                    "pm10": 110,
                    "nox": 75,
                    "sox": 50,
                    "co2": 560,
                },
            }
        )

    return [_normalize_hotspot(r) for r in records if r["lat"] is not None and r["lon"] is not None]
