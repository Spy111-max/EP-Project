from __future__ import annotations

from typing import Any

from flask import Blueprint, jsonify, request

from psas.data_sources.aqi_data import get_hotspots, get_live_openaq
from psas.services.pollution_service import enrich_hotspot

aqi_bp = Blueprint("aqi", __name__)


@aqi_bp.get("/api/health")
def health() -> Any:
    return jsonify({"status": "ok", "service": "PSAS API"})


@aqi_bp.get("/api/hotspots")
def hotspots() -> Any:
    city_query = request.args.get("city", "").strip().lower()
    source = request.args.get("source", "mock")

    if source == "openaq":
        try:
            spots = get_live_openaq()
        except Exception:
            spots = get_hotspots()
    else:
        spots = get_hotspots()

    spots = [enrich_hotspot(spot) for spot in spots]

    if city_query:
        spots = [s for s in spots if city_query in s["city"].lower() or city_query in s["name"].lower()]

    spots.sort(key=lambda item: item["urgency_score"], reverse=True)
    return jsonify({"count": len(spots), "results": spots})
