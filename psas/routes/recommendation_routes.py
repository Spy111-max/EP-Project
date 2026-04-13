from __future__ import annotations

from typing import Any

from flask import Blueprint, jsonify, request

from psas.data_sources.aqi_data import get_hotspots
from psas.services.recommendation_service import (
    build_recommendations,
    build_viewport_recommendations,
    get_zone_by_id,
    get_zones_by_ids,
)

recommendation_bp = Blueprint("recommendations", __name__)


@recommendation_bp.get("/api/recommendations")
def recommendations() -> Any:
    zone_id = request.args.get("zone_id")
    hotspots_data = get_hotspots()

    zone = get_zone_by_id(hotspots_data, zone_id)
    if not zone:
        return jsonify({"error": "Zone not found"}), 404

    return jsonify(build_recommendations(zone))


@recommendation_bp.get("/api/recommendations/viewport")
def viewport_recommendations() -> Any:
    zone_ids_raw = request.args.get("zone_ids", "")
    zone_ids = [zone_id.strip() for zone_id in zone_ids_raw.split(",") if zone_id.strip()]
    if not zone_ids:
        return jsonify({"error": "No zone ids provided"}), 400

    hotspots_data = get_hotspots()
    zones = get_zones_by_ids(hotspots_data, zone_ids)
    if not zones:
        return jsonify({"error": "No matching zones found"}), 404

    return jsonify(build_viewport_recommendations(zones))
