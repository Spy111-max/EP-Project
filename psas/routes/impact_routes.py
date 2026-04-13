from __future__ import annotations

from typing import Any

from flask import Blueprint, jsonify, request

from psas.data_sources.aqi_data import get_hotspots
from psas.services.impact_service import build_impact_response
from psas.services.recommendation_service import build_aggregated_zone, get_zone_by_id, get_zones_by_ids

impact_bp = Blueprint("impact", __name__)


@impact_bp.get("/api/impact")
def impact() -> Any:
    zone_id = request.args.get("zone_id")
    hotspots_data = get_hotspots()
    zone = get_zone_by_id(hotspots_data, zone_id)

    if not zone:
        return jsonify({"error": "Zone not found"}), 404

    return jsonify(build_impact_response(zone_id or "", zone))


@impact_bp.get("/api/impact/viewport")
def viewport_impact() -> Any:
    zone_ids_raw = request.args.get("zone_ids", "")
    zone_ids = [zone_id.strip() for zone_id in zone_ids_raw.split(",") if zone_id.strip()]
    if not zone_ids:
        return jsonify({"error": "No zone ids provided"}), 400

    hotspots_data = get_hotspots()
    zones = get_zones_by_ids(hotspots_data, zone_ids)
    if not zones:
        return jsonify({"error": "No matching zones found"}), 404

    aggregated_zone = build_aggregated_zone(zones)
    return jsonify(build_impact_response("viewport-zone", aggregated_zone))
