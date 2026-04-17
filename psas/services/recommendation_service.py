from __future__ import annotations

from collections import Counter
from typing import Any

from psas.data_sources.tree_data import get_species_catalog
from psas.ml.recommender_model import predict_scores
from psas.types import ZoneProfile
from psas.services.land_structure_service import infer_land_structure
from psas.services.pollution_service import normalize


def build_zone_profile(zone: dict[str, Any]) -> ZoneProfile:
    return ZoneProfile(
        pm25=zone["pollution"]["pm25"],
        pm10=zone["pollution"]["pm10"],
        nox=zone["pollution"]["nox"],
        sox=zone["pollution"]["sox"],
        co2=zone["pollution"]["co2"],
        soil=zone["environment"]["soil"],
        rainfall_mm=zone["environment"]["rainfall_mm"],
        temperature_c=zone["environment"]["temperature_c"],
        zone_type=zone["zone_type"],
    )


def get_zone_by_id(hotspots: list[dict[str, Any]], zone_id: str | None) -> dict[str, Any] | None:
    if not zone_id:
        return None
    return next(
        (
            item
            for item in hotspots
            if item.get("id") == zone_id or item.get("zone_id") == zone_id
        ),
        None,
    )


def score_species(species: dict[str, Any], profile: ZoneProfile) -> float:
    pollution_fit = (
        0.35 * normalize(species["absorption"]["pm25"], 0, 10)
        + 0.2 * normalize(species["absorption"]["pm10"], 0, 10)
        + 0.2 * normalize(species["absorption"]["nox"], 0, 10)
        + 0.15 * normalize(species["absorption"]["sox"], 0, 10)
        + 0.1 * normalize(species["absorption"]["co2"], 0, 10)
    )

    climate_window = species["climate_window"]
    temp_delta = abs(profile.temperature_c - climate_window["temperature_c"]["ideal"])
    rain_delta = abs(profile.rainfall_mm - climate_window["rainfall_mm"]["ideal"])

    temp_score = max(0.0, 1 - temp_delta / climate_window["temperature_c"]["tolerance"])
    rain_score = max(0.0, 1 - rain_delta / climate_window["rainfall_mm"]["tolerance"])

    soil_score = 1.0 if profile.soil in species["soil_types"] else 0.35
    survival_probability = max(0.2, 0.4 * temp_score + 0.35 * rain_score + 0.25 * soil_score)

    growth_bias = 1.15 if species["growth_category"] == "fast" else 1.0
    long_term_bias = 1.15 if species["growth_category"] == "long_term" else 1.0

    fast_track_score = (0.6 * pollution_fit + 0.4 * survival_probability) * growth_bias
    long_track_score = (0.55 * pollution_fit + 0.45 * survival_probability) * long_term_bias

    if profile.zone_type in {"industrial", "traffic"}:
        combined = 0.65 * fast_track_score + 0.35 * long_track_score
    else:
        combined = 0.45 * fast_track_score + 0.55 * long_track_score

    return round(combined, 4)


def score_catalog(profile: ZoneProfile) -> list[dict[str, Any]]:
    zone_payload = {
        "zone_type": profile.zone_type,
        "pollution": {
            "pm25": profile.pm25,
            "pm10": profile.pm10,
            "nox": profile.nox,
            "sox": profile.sox,
            "co2": profile.co2,
        },
        "environment": {
            "soil": profile.soil,
            "rainfall_mm": profile.rainfall_mm,
            "temperature_c": profile.temperature_c,
        },
    }

    species_catalog = get_species_catalog()
    ml_scores = predict_scores(zone_payload, species_catalog)

    scored = []
    for species in species_catalog:
        base_score = score_species(species, profile)
        ml_score = None
        blended_score = base_score

        if ml_scores:
            ml_score = ml_scores.get(species["scientific_name"])
            if ml_score is not None:
                blended_score = round(0.62 * base_score + 0.38 * ml_score, 4)

        scored.append(
            {
                **species,
                "rule_score": base_score,
                "ml_score": ml_score,
                "match_score": blended_score,
                "model_used": ml_score is not None,
            }
        )
    return scored


def infer_space_tier(species: dict[str, Any]) -> str:
    scientific_name = species.get("scientific_name", "").lower()
    common_name = species.get("common_name", "").lower()

    large_markers = (
        "ficus benghalensis",
        "ficus religiosa",
        "mangifera indica",
        "tectona grandis",
        "dalbergia sissoo",
        "swietenia mahagoni",
    )
    compact_markers = (
        "moringa",
        "cassia fistula",
        "bauhinia",
        "polyalthia",
        "phyllanthus",
        "amla",
        "kachnar",
    )

    if any(marker in scientific_name for marker in large_markers) or any(
        marker in common_name for marker in ("banyan", "peepal", "mango")
    ):
        return "large"

    if any(marker in scientific_name for marker in compact_markers):
        return "compact"

    growth_years = species.get("growth_years", 8)
    return "medium" if growth_years >= 8 else "compact"


def apply_land_feasibility_filter(
    species_scores: list[dict[str, Any]],
    land_classification: str,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if land_classification == "dense_built":
        allowed_tiers = {"compact"}
        penalty_by_tier = {"compact": 1.0, "medium": 0.72, "large": 0.5}
    elif land_classification == "mixed_urban":
        allowed_tiers = {"compact", "medium"}
        penalty_by_tier = {"compact": 1.0, "medium": 0.92, "large": 0.62}
    else:
        allowed_tiers = {"compact", "medium", "large"}
        penalty_by_tier = {"compact": 0.95, "medium": 1.0, "large": 1.02}

    adjusted: list[dict[str, Any]] = []
    for item in species_scores:
        space_tier = infer_space_tier(item)
        land_adjusted_score = round(item["match_score"] * penalty_by_tier[space_tier], 4)
        adjusted.append(
            {
                **item,
                "space_tier": space_tier,
                "land_adjusted_score": land_adjusted_score,
                "land_fit": space_tier in allowed_tiers,
            }
        )

    preferred = [item for item in adjusted if item["land_fit"]]
    ranked_all = sorted(adjusted, key=lambda item: item["land_adjusted_score"], reverse=True)

    return ranked_all, {
        "allowed_space_tiers": sorted(allowed_tiers),
        "fallback_used": not bool(preferred),
    }


def top_by_growth(
    ranked_species: list[dict[str, Any]],
    growth_category: str,
    limit: int,
) -> tuple[list[dict[str, Any]], bool]:
    preferred = [
        item
        for item in ranked_species
        if item["growth_category"] == growth_category and item["land_fit"]
    ]
    if len(preferred) >= limit:
        return preferred[:limit], False

    fallback = [item for item in ranked_species if item["growth_category"] == growth_category]
    return fallback[:limit], True


def build_recommendations(zone: dict[str, Any]) -> dict[str, Any]:
    profile = build_zone_profile(zone)
    species_scores = score_catalog(profile)
    land_structure = infer_land_structure(zone)
    filtered_species, filter_meta = apply_land_feasibility_filter(
        species_scores,
        land_structure["land_classification"],
    )

    fast, fast_fallback_used = top_by_growth(filtered_species, "fast", 4)
    long_term, long_fallback_used = top_by_growth(filtered_species, "long_term", 4)

    top_species = [item["common_name"] for item in (fast[:2] or long_term[:2])]
    action_plan = {
        "summary": (
            f"The next action phase for {zone.get('name', 'the selected area')} should prioritize fast canopy establishment, "
            "source-side suppression, and maintenance scheduling to lower pollution as quickly as possible."
        ),
        "steps": [
            f"Prioritize {' and '.join(top_species) if top_species else 'the highest-fit species'} along traffic corridors and hotspot edges.",
            "Plant during the monsoon window and apply mulch rings to improve early survival.",
            "Pair greening with dust-source control, including curb cleaning and reduced idling near congestion points.",
            "Track PM2.5, PM10, and PM1 after each planting phase and replant failed pockets in the next season.",
        ],
    }

    return {
        "zone": zone,
        "land_structure": land_structure,
        "land_filter": {
            **filter_meta,
            "growth_bucket_fallback": {
                "fast": fast_fallback_used,
                "long_term": long_fallback_used,
            },
        },
        "fast_growing": fast,
        "long_term": long_term,
        "action_plan": action_plan,
    }


def get_zones_by_ids(hotspots: list[dict[str, Any]], zone_ids: list[str]) -> list[dict[str, Any]]:
    zone_id_set = set(zone_ids)
    return [zone for zone in hotspots if zone["id"] in zone_id_set]


def build_aggregated_zone(zones: list[dict[str, Any]], label: str = "Viewport Plan") -> dict[str, Any]:
    if not zones:
        raise ValueError("No zones available for aggregation")

    weighted = []
    for zone in zones:
        pm25 = zone["pollution"]["pm25"]
        weight = max(pm25 / 100, 0.2)
        weighted.append((zone, weight))

    total_weight = sum(weight for _, weight in weighted)

    def weighted_value(section: str, key: str) -> float:
        value = sum(zone[section][key] * weight for zone, weight in weighted) / total_weight
        return round(value, 2)

    zone_type = Counter(zone["zone_type"] for zone, _ in weighted).most_common(1)[0][0]
    soil = Counter(zone["environment"]["soil"] for zone, _ in weighted).most_common(1)[0][0]
    center_lat = round(sum(zone["lat"] for zone, _ in weighted) / len(weighted), 4)
    center_lon = round(sum(zone["lon"] for zone, _ in weighted) / len(weighted), 4)

    return {
        "id": "viewport-zone",
        "name": label,
        "city": "Visible Map Area",
        "country": zones[0].get("country", "India"),
        "lat": center_lat,
        "lon": center_lon,
        "zone_type": zone_type,
        "pollution": {
            "pm25": weighted_value("pollution", "pm25"),
            "pm10": weighted_value("pollution", "pm10"),
            "nox": weighted_value("pollution", "nox"),
            "sox": weighted_value("pollution", "sox"),
            "co2": weighted_value("pollution", "co2"),
        },
        "environment": {
            "soil": soil,
            "rainfall_mm": weighted_value("environment", "rainfall_mm"),
            "temperature_c": weighted_value("environment", "temperature_c"),
        },
    }


def build_viewport_recommendations(zones: list[dict[str, Any]]) -> dict[str, Any]:
    aggregate_zone = build_aggregated_zone(zones)
    recommendations = build_recommendations(aggregate_zone)
    recommendations["zone_count"] = len(zones)
    return recommendations
