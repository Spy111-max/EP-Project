from __future__ import annotations

from typing import Any

import requests
from flask import Blueprint, Response, jsonify, request

from psas.data_sources.aqi_data import get_hotspots
from psas.services.land_structure_service import SATELLITE_LAYERS, infer_land_structure
from psas.services.recommendation_service import get_zone_by_id


land_bp = Blueprint("land", __name__)


@land_bp.get("/api/land-structure")
def land_structure() -> Any:
    zone_id = request.args.get("zone_id")
    hotspots = get_hotspots()
    zone = get_zone_by_id(hotspots, zone_id)

    if not zone:
        return jsonify({"error": "Zone not found"}), 404

    payload = infer_land_structure(zone)
    return jsonify({"zone_id": zone_id, **payload})


@land_bp.get("/api/land-structure/legend")
def land_legend() -> Any:
    hotspots = get_hotspots()
    zone_id = request.args.get("zone_id")
    zone = get_zone_by_id(hotspots, zone_id)

    if not zone:
        return jsonify({"error": "Zone not found"}), 404

    return jsonify({"zone_id": zone_id, "legend": infer_land_structure(zone)["legend"]})


@land_bp.get("/api/land-structure/wms")
def land_wms_proxy() -> Response:
    provider_id = request.args.get("provider", "worldcover2021")
    if provider_id not in SATELLITE_LAYERS:
        return jsonify({"error": "Unknown satellite provider"}), 400

    proxy_params = request.args.to_dict(flat=True)
    proxy_params.pop("provider", None)
    proxy_params["LAYERS"] = SATELLITE_LAYERS[provider_id]["layer"]

    response = requests.get(
        "https://services.terrascope.be/wms/v2",
        params=proxy_params,
        timeout=30,
    )

    return Response(
        response.content,
        status=response.status_code,
        content_type=response.headers.get("Content-Type", "image/png"),
    )