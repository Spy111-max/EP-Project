from __future__ import annotations

from typing import Any

from flask import Blueprint, jsonify

from psas.data_sources.aqi_data import get_hotspots
from psas.data_sources.tree_data import get_species_catalog
from psas.ml.recommender_model import get_model_status, train_recommender_model

ml_bp = Blueprint("ml", __name__)


@ml_bp.get("/api/model/status")
def model_status() -> Any:
    return jsonify(get_model_status())


@ml_bp.post("/api/model/train")
def train_model() -> Any:
    hotspots = get_hotspots()
    species = get_species_catalog()
    result = train_recommender_model(hotspots, species)

    if not result.get("trained"):
        return jsonify(result), 500

    return jsonify(result)
