from __future__ import annotations

from typing import Any

from psas.constants import ENV_DATA_DIR
from psas.data_sources.json_store import load_json_file


def get_soil_profiles() -> list[dict[str, Any]]:
    return load_json_file("environment/soil_profiles_india.json")


def get_climate_normals() -> list[dict[str, Any]]:
    return load_json_file("environment/climate_normals_india.json")


def get_pollution_factor_weights() -> dict[str, float]:
    with (ENV_DATA_DIR / "pollution_factor_weights.json").open("r", encoding="utf-8") as file:
        import json

        return json.load(file)
