from __future__ import annotations

import math
from typing import Any

from psas.services.pollution_service import classify_pollution
from psas.services.recommendation_service import build_zone_profile, score_catalog


def project_impact(zone: dict[str, Any], selected_species: list[dict[str, Any]]) -> dict[str, Any]:
    base_pm25 = zone["pollution"]["pm25"]
    base_co2 = zone["pollution"]["co2"]

    absorption_index = sum(s["absorption"]["pm25"] for s in selected_species) / max(len(selected_species), 1)
    carbon_index = sum(s["carbon_sequestration_kg_year"] for s in selected_species) / max(len(selected_species), 1)

    forecast = []
    for years in [5, 10, 20]:
        pm25_drop = min(base_pm25 * 0.72, math.log1p(years) * absorption_index * 2.1)
        projected_pm25 = round(max(8.0, base_pm25 - pm25_drop), 2)

        trees_planted = 1500 + years * 250
        sequestration = round((carbon_index * trees_planted * years) / 1000, 2)
        forecast.append(
            {
                "years": years,
                "projected_pm25": projected_pm25,
                "aqi_band": classify_pollution(projected_pm25),
                "carbon_sequestration_tonnes": sequestration,
                "estimated_trees": trees_planted,
            }
        )

    return {
        "base_pm25": base_pm25,
        "base_co2": base_co2,
        "forecast": forecast,
    }


def build_impact_response(zone_id: str, zone: dict[str, Any]) -> dict[str, Any]:
    profile = build_zone_profile(zone)
    scored = score_catalog(profile)
    selected = sorted(scored, key=lambda item: item["match_score"], reverse=True)[:3]

    return {
        "zone_id": zone_id,
        "selected_species": selected,
        "impact": project_impact(zone, selected),
    }
