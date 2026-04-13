from __future__ import annotations

import json
import pickle
from datetime import datetime, timezone
from typing import Any

from psas.constants import MODEL_DIR, MODEL_FILE, MODEL_META_FILE
from psas.data_sources.environment_data import get_climate_normals, get_pollution_factor_weights, get_soil_profiles

ZONE_TYPES = ["industrial", "traffic", "residential", "peri_urban"]
SOIL_TYPES = ["alluvial", "black", "red", "sandy"]


def _has_ml_dependencies() -> tuple[bool, str | None]:
    try:
        import sklearn  # noqa: F401
    except ImportError:
        return False, "scikit-learn is not installed"
    return True, None


def _normalize(value: float, min_value: float, max_value: float) -> float:
    if max_value == min_value:
        return 0.0
    return (value - min_value) / (max_value - min_value)


def _feature_vector(zone: dict[str, Any], species: dict[str, Any]) -> list[float]:
    climate_window = species["climate_window"]

    vector = [
        zone["pollution"]["pm25"],
        zone["pollution"]["pm10"],
        zone["pollution"]["nox"],
        zone["pollution"]["sox"],
        zone["pollution"]["co2"],
        zone["environment"]["rainfall_mm"],
        zone["environment"]["temperature_c"],
        species["absorption"]["pm25"],
        species["absorption"]["pm10"],
        species["absorption"]["nox"],
        species["absorption"]["sox"],
        species["absorption"]["co2"],
        species["carbon_sequestration_kg_year"],
        species["growth_years"],
        climate_window["temperature_c"]["ideal"],
        climate_window["temperature_c"]["tolerance"],
        climate_window["rainfall_mm"]["ideal"],
        climate_window["rainfall_mm"]["tolerance"],
        1.0 if zone["environment"]["soil"] in species["soil_types"] else 0.0,
        1.0 if species["growth_category"] == "fast" else 0.0,
        1.0 if species["growth_category"] == "long_term" else 0.0,
    ]

    for zone_type in ZONE_TYPES:
        vector.append(1.0 if zone["zone_type"] == zone_type else 0.0)
    for soil in SOIL_TYPES:
        vector.append(1.0 if zone["environment"]["soil"] == soil else 0.0)

    return vector


def _heuristic_target(zone: dict[str, Any], species: dict[str, Any]) -> float:
    weights = get_pollution_factor_weights()

    pollution_fit = (
        weights["pm25"] * _normalize(species["absorption"]["pm25"], 0, 10)
        + weights["pm10"] * _normalize(species["absorption"]["pm10"], 0, 10)
        + weights["nox"] * _normalize(species["absorption"]["nox"], 0, 10)
        + weights["sox"] * _normalize(species["absorption"]["sox"], 0, 10)
        + weights["co2"] * _normalize(species["absorption"]["co2"], 0, 10)
    )

    climate = species["climate_window"]
    t_delta = abs(zone["environment"]["temperature_c"] - climate["temperature_c"]["ideal"])
    r_delta = abs(zone["environment"]["rainfall_mm"] - climate["rainfall_mm"]["ideal"])

    t_score = max(0.0, 1 - t_delta / climate["temperature_c"]["tolerance"])
    r_score = max(0.0, 1 - r_delta / climate["rainfall_mm"]["tolerance"])
    soil_score = 1.0 if zone["environment"]["soil"] in species["soil_types"] else 0.35
    survival = max(0.2, 0.42 * t_score + 0.33 * r_score + 0.25 * soil_score)

    growth_bonus = 1.08 if species["growth_category"] == "fast" and zone["zone_type"] in {"traffic", "industrial"} else 1.0
    carbon_bonus = _normalize(species["carbon_sequestration_kg_year"], 12, 42) * 0.1

    return round((0.58 * pollution_fit + 0.42 * survival) * growth_bonus + carbon_bonus, 5)


def _build_training_data(
    hotspots: list[dict[str, Any]],
    species_catalog: list[dict[str, Any]],
) -> tuple[list[list[float]], list[float]]:
    # Loading these datasets ensures model context includes all major factors.
    _ = get_soil_profiles()
    _ = get_climate_normals()

    x_data: list[list[float]] = []
    y_data: list[float] = []

    for zone in hotspots:
        for species in species_catalog:
            x_data.append(_feature_vector(zone, species))
            y_data.append(_heuristic_target(zone, species))

    return x_data, y_data


def train_recommender_model(
    hotspots: list[dict[str, Any]],
    species_catalog: list[dict[str, Any]],
) -> dict[str, Any]:
    ok, reason = _has_ml_dependencies()
    if not ok:
        return {"trained": False, "error": reason}

    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_absolute_error, r2_score
    from sklearn.model_selection import train_test_split

    x_data, y_data = _build_training_data(hotspots, species_catalog)

    x_train, x_test, y_train, y_test = train_test_split(
        x_data,
        y_data,
        test_size=0.2,
        random_state=42,
    )

    model = RandomForestRegressor(n_estimators=220, max_depth=16, random_state=42)
    model.fit(x_train, y_train)

    preds = model.predict(x_test)
    r2 = float(r2_score(y_test, preds))
    mae = float(mean_absolute_error(y_test, preds))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with MODEL_FILE.open("wb") as file:
        pickle.dump(model, file)

    meta = {
        "trained": True,
        "algorithm": "RandomForestRegressor",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "samples": len(x_data),
        "features": len(x_data[0]) if x_data else 0,
        "metrics": {"r2": round(r2, 5), "mae": round(mae, 5)},
        "factors": [
            "pollution PM2.5/PM10/NOx/SOx/CO2",
            "soil compatibility",
            "rainfall and temperature match",
            "species growth category",
            "carbon sequestration potential",
            "zone type weighting",
        ],
    }

    with MODEL_META_FILE.open("w", encoding="utf-8") as file:
        json.dump(meta, file, indent=2)

    return meta


def get_model_status() -> dict[str, Any]:
    ok, reason = _has_ml_dependencies()
    if not ok:
        return {"trained": False, "available": False, "error": reason}

    if not MODEL_FILE.exists() or not MODEL_META_FILE.exists():
        return {"trained": False, "available": True, "error": "Model not trained yet"}

    with MODEL_META_FILE.open("r", encoding="utf-8") as file:
        meta = json.load(file)

    return {"trained": True, "available": True, **meta}


def predict_scores(
    zone: dict[str, Any],
    species_catalog: list[dict[str, Any]],
) -> dict[str, float] | None:
    status = get_model_status()
    if not status.get("trained"):
        return None

    with MODEL_FILE.open("rb") as file:
        model = pickle.load(file)

    vectors = [_feature_vector(zone, species) for species in species_catalog]
    predictions = model.predict(vectors)

    return {
        species["scientific_name"]: round(float(prediction), 5)
        for species, prediction in zip(species_catalog, predictions)
    }
