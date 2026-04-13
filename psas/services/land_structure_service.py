from __future__ import annotations

import hashlib
import json
import math
import time
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from typing import Any

import requests
from PIL import Image

from psas.constants import DATA_DIR


SATELLITE_WMS_BASE = "https://services.terrascope.be/wms/v2"
SATELLITE_CACHE_FILE = DATA_DIR / "cache" / "land_structure_cache.json"
SATELLITE_CACHE_TTL_SECONDS = 60 * 60 * 24 * 14
SATELLITE_CACHE_VERSION = "raster-v3"

WORLD_COVER_CLASS_MAP: dict[int, dict[str, Any]] = {
    10: {"label": "Tree cover", "family": "green_open", "color": (0, 100, 0)},
    20: {"label": "Shrubland", "family": "green_open", "color": (255, 187, 34)},
    30: {"label": "Grassland", "family": "green_open", "color": (255, 255, 76)},
    40: {"label": "Cropland", "family": "agriculture", "color": (240, 150, 255)},
    50: {"label": "Built-up", "family": "built_up", "color": (250, 0, 0)},
    60: {"label": "Bare / sparse vegetation", "family": "green_open", "color": (180, 180, 180)},
    70: {"label": "Snow and ice", "family": "other", "color": (240, 240, 240)},
    80: {"label": "Permanent water", "family": "water", "color": (0, 100, 200)},
    90: {"label": "Herbaceous wetland", "family": "water", "color": (0, 150, 160)},
    95: {"label": "Mangroves", "family": "green_open", "color": (0, 207, 117)},
    100: {"label": "Moss and lichen", "family": "green_open", "color": (250, 230, 160)},
}

SATELLITE_LAYERS: dict[str, dict[str, Any]] = {
    "worldcover2021": {
        "provider": "ESA WorldCover",
        "layer": "WORLDCOVER_2021_MAP",
        "label": "ESA WorldCover 2021",
        "opacity": 0.56,
        "analysis": "classification",
        "weight": 0.58,
        "default": True,
    },
    "worldcover2020": {
        "provider": "ESA WorldCover",
        "layer": "WORLDCOVER_2020_MAP",
        "label": "ESA WorldCover 2020",
        "opacity": 0.56,
        "analysis": "classification",
        "weight": 0.42,
        "default": False,
    },
    "sentinel_ndvi": {
        "provider": "Sentinel-2 derived",
        "layer": "WORLDCOVER_2021_S2_NDVI",
        "label": "Sentinel-2 NDVI",
        "opacity": 0.42,
        "analysis": "vegetation_index",
        "weight": 0.0,
        "default": False,
    },
}


def _read_cache() -> dict[str, Any]:
    if not SATELLITE_CACHE_FILE.exists():
        return {}
    try:
        return json.loads(SATELLITE_CACHE_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _write_cache(cache: dict[str, Any]) -> None:
    SATELLITE_CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    SATELLITE_CACHE_FILE.write_text(json.dumps(cache, indent=2), encoding="utf-8")


def _cache_key(zone: dict[str, Any]) -> str:
    payload = {
        "version": SATELLITE_CACHE_VERSION,
        "lat": round(float(zone["lat"]), 4),
        "lon": round(float(zone["lon"]), 4),
        "zone_type": zone.get("zone_type", "unknown"),
        "layers": list(SATELLITE_LAYERS.keys()),
    }
    digest = hashlib.sha1(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
    return digest


def _normalize_mix(mix: dict[str, float]) -> dict[str, float]:
    total = sum(max(value, 0.0) for value in mix.values())
    if total <= 0:
        return {"built_up": 0.0, "agriculture": 0.0, "green_open": 0.0, "water": 0.0}
    return {key: round(max(value, 0.0) / total, 4) for key, value in mix.items()}


def _family_from_class_code(class_code: int) -> str:
    return WORLD_COVER_CLASS_MAP.get(class_code, {}).get("family", "other")


def _palette_distance(rgb: tuple[int, int, int], palette_rgb: tuple[int, int, int]) -> float:
    return math.sqrt(sum((component - palette_component) ** 2 for component, palette_component in zip(rgb, palette_rgb)))


def _nearest_worldcover_class(rgb: tuple[int, int, int]) -> int:
    best_code = 60
    best_distance = float("inf")
    for class_code, metadata in WORLD_COVER_CLASS_MAP.items():
        distance = _palette_distance(rgb, metadata["color"])
        if distance < best_distance:
            best_distance = distance
            best_code = class_code
    return best_code


def _zone_span(zone: dict[str, Any]) -> float:
    zone_type = zone.get("zone_type", "")
    span_by_zone_type = {
        "traffic": 1600.0,
        "industrial": 1800.0,
        "residential": 2200.0,
        "peri_urban": 3000.0,
    }
    return span_by_zone_type.get(zone_type, 2400.0)


def _lonlat_to_3857(lon: float, lat: float) -> tuple[float, float]:
    radius = 6378137.0
    x = radius * math.radians(lon)
    y = radius * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    return x, y


def _zone_bbox_3857(zone: dict[str, Any]) -> tuple[float, float, float, float]:
    center_x, center_y = _lonlat_to_3857(float(zone["lon"]), float(zone["lat"]))
    span = _zone_span(zone)
    return center_x - span, center_y - span, center_x + span, center_y + span


@lru_cache(maxsize=64)
def _fetch_wms_tile(provider_id: str, bbox: str, width: int = 256, height: int = 256) -> bytes:
    layer = SATELLITE_LAYERS[provider_id]["layer"]
    params = {
        "SERVICE": "WMS",
        "VERSION": "1.1.1",
        "REQUEST": "GetMap",
        "LAYERS": layer,
        "STYLES": "",
        "SRS": "EPSG:3857",
        "BBOX": bbox,
        "WIDTH": width,
        "HEIGHT": height,
        "FORMAT": "image/png",
        "TRANSPARENT": "TRUE",
    }
    response = requests.get(SATELLITE_WMS_BASE, params=params, timeout=25)
    response.raise_for_status()
    return response.content


def _sample_positions(size: int, sample_count: int = 32) -> list[int]:
    step = max(1, size // sample_count)
    positions = list(range(step // 2, size, step))
    return positions[:sample_count]


def _count_family_mix(image_bytes: bytes) -> dict[str, Any]:
    image = Image.open(BytesIO(image_bytes)).convert("RGBA")
    width, height = image.size
    x_positions = _sample_positions(width)
    y_positions = _sample_positions(height)

    family_counts = {"built_up": 0, "agriculture": 0, "green_open": 0, "water": 0, "other": 0}
    class_counts: dict[int, int] = {}
    total_samples = 0

    for x in x_positions:
        for y in y_positions:
            red, green, blue, alpha = image.getpixel((x, y))
            if alpha < 10:
                continue

            class_code = _nearest_worldcover_class((red, green, blue))
            family = _family_from_class_code(class_code)
            class_counts[class_code] = class_counts.get(class_code, 0) + 1
            family_counts[family] = family_counts.get(family, 0) + 1
            total_samples += 1

    usable_counts = {key: value for key, value in family_counts.items() if key != "other"}
    mix = _normalize_mix(usable_counts)

    dominant_class = None
    dominant_class_share = 0.0
    if class_counts and total_samples > 0:
        dominant_class = max(class_counts.items(), key=lambda item: item[1])[0]
        dominant_class_share = class_counts[dominant_class] / total_samples

    family_share = max(mix.values()) if mix else 0.0
    confidence = max(0.18, min(0.99, round(0.55 * dominant_class_share + 0.45 * family_share, 4)))

    return {
        "class_counts": class_counts,
        "family_counts": family_counts,
        "family_mix": mix,
        "sample_count": total_samples,
        "dominant_class": dominant_class,
        "confidence": confidence,
    }


def _analysis_for_provider(zone: dict[str, Any], provider_id: str) -> dict[str, Any]:
    bbox = _zone_bbox_3857(zone)
    bbox_text = ",".join(f"{value:.2f}" for value in bbox)
    tile_bytes = _fetch_wms_tile(provider_id, bbox_text)
    raster_stats = _count_family_mix(tile_bytes)

    layer = SATELLITE_LAYERS[provider_id]
    return {
        "provider_id": provider_id,
        "provider": layer["provider"],
        "label": layer["label"],
        "layer": layer["layer"],
        "analysis": layer["analysis"],
        "weight": layer["weight"],
        "opacity": layer["opacity"],
        **raster_stats,
    }


def _blend_family_mixes(provider_results: list[dict[str, Any]]) -> dict[str, float]:
    blended = {"built_up": 0.0, "agriculture": 0.0, "green_open": 0.0, "water": 0.0}
    total_weight = 0.0

    for result in provider_results:
        source_weight = float(result.get("weight", 0.0))
        confidence = float(result.get("confidence", 0.0))
        effective_weight = max(0.01, source_weight * max(confidence, 0.15))
        for family in blended:
            blended[family] += result["family_mix"].get(family, 0.0) * effective_weight
        total_weight += effective_weight

    if total_weight <= 0:
        return {"built_up": 0.0, "agriculture": 0.0, "green_open": 0.0, "water": 0.0}

    return {family: round(value / total_weight, 4) for family, value in blended.items()}


def _analysis_agreement(provider_results: list[dict[str, Any]]) -> float:
    if len(provider_results) < 2:
        return 0.55

    first_mix = provider_results[0]["family_mix"]
    second_mix = provider_results[1]["family_mix"]
    mismatch = sum(abs(first_mix.get(key, 0.0) - second_mix.get(key, 0.0)) for key in first_mix)
    return round(max(0.15, 1 - mismatch / 2), 4)


def _confidence_breakdown(provider_results: list[dict[str, Any]], agreement: float) -> dict[str, Any]:
    per_source = {
        result["provider_id"]: {
            "confidence": result["confidence"],
            "sample_count": result["sample_count"],
            "dominant_class": result["dominant_class"],
            "family_mix": result["family_mix"],
        }
        for result in provider_results
    }
    average_source_confidence = sum(result["confidence"] for result in provider_results) / max(len(provider_results), 1)
    combined = round(0.6 * average_source_confidence + 0.4 * agreement, 4)
    return {
        "per_source": per_source,
        "agreement": agreement,
        "average_source_confidence": round(average_source_confidence, 4),
        "combined": combined,
    }


def _land_classification(blended: dict[str, float]) -> str:
    built_up = blended.get("built_up", 0.0)
    agriculture = blended.get("agriculture", 0.0)
    green_open = blended.get("green_open", 0.0)

    if built_up >= 0.58:
        return "dense_built"
    if built_up >= 0.32 or (agriculture < 0.2 and green_open < 0.3):
        return "mixed_urban"
    return "open_or_periurban"


def _land_feasibility_score(blended: dict[str, float], confidence: float) -> float:
    built_up = blended.get("built_up", 0.0)
    agriculture = blended.get("agriculture", 0.0)
    green_open = blended.get("green_open", 0.0)
    water = blended.get("water", 0.0)

    usable_land = (green_open * 0.5) + (agriculture * 0.3) + (water * 0.1)
    built_up_relief = (1 - built_up) * 0.1
    score = max(0.0, min(1.0, usable_land + built_up_relief + confidence * 0.08))
    return round(score, 4)


def _suggest_measures(classification: str, blended: dict[str, float]) -> list[str]:
    if classification == "dense_built":
        return [
            "Use compact species in medians, sidewalks, and setbacks.",
            "Reserve large-canopy trees for parks, campuses, and redevelopment parcels.",
            "Prefer containers, vertical greening, and terrace planting where open pits are limited.",
            "Prioritize irrigation and root-barrier planning in hardscape zones.",
        ]

    if classification == "mixed_urban":
        return [
            "Mix medium-canopy native trees with compact species near transport corridors.",
            "Protect vacant plots and convert them into neighborhood green pockets.",
            "Use linear belts along roads with high NOx and PM loads.",
            "Cluster plantations to improve canopy continuity and maintenance efficiency.",
        ]

    return [
        "Allocate long-term canopy species on open parcels and peri-urban edges.",
        "Retain agricultural buffer strips and add windbreak rows for dust control.",
        "Create layered native belts to maximize pollution capture and cooling.",
        "Protect water-edge vegetation to stabilize soil and support microclimate cooling.",
    ]


def _fallback_structure(zone: dict[str, Any]) -> dict[str, Any]:
    zone_type = zone.get("zone_type", "unknown")
    fallback_mix_by_zone = {
        "traffic": {"built_up": 0.72, "agriculture": 0.08, "green_open": 0.17, "water": 0.03},
        "industrial": {"built_up": 0.67, "agriculture": 0.1, "green_open": 0.19, "water": 0.04},
        "residential": {"built_up": 0.56, "agriculture": 0.11, "green_open": 0.28, "water": 0.05},
        "peri_urban": {"built_up": 0.31, "agriculture": 0.41, "green_open": 0.24, "water": 0.04},
    }
    blended = _normalize_mix(fallback_mix_by_zone.get(zone_type, {"built_up": 0.5, "agriculture": 0.2, "green_open": 0.24, "water": 0.06}))
    confidence = 0.24
    classification = _land_classification(blended)
    return {
        "analysis_mode": "fallback",
        "sources": {},
        "blended_land_cover_mix": blended,
        "confidence": confidence,
        "confidence_breakdown": {
            "per_source": {},
            "agreement": 0.0,
            "average_source_confidence": confidence,
            "combined": confidence,
        },
        "land_feasibility_score": _land_feasibility_score(blended, confidence),
        "land_classification": classification,
        "measures": _suggest_measures(classification, blended),
        "map_layers": get_land_map_layers(),
        "legend": get_land_legend(),
        "sample_count": 0,
    }


def get_land_legend() -> list[dict[str, Any]]:
    legend = []
    for class_code, metadata in WORLD_COVER_CLASS_MAP.items():
        if metadata["family"] == "other":
            continue
        legend.append(
            {
                "class_code": class_code,
                "label": metadata["label"],
                "family": metadata["family"],
                "color": "#%02x%02x%02x" % metadata["color"],
            }
        )
    return legend


def get_land_map_layers() -> list[dict[str, Any]]:
    layers = []
    for provider_id, metadata in SATELLITE_LAYERS.items():
        layers.append(
            {
                "id": provider_id,
                "provider": metadata["provider"],
                "label": metadata["label"],
                "layer": metadata["layer"],
                "opacity": metadata["opacity"],
                "default": metadata.get("default", False),
                "analysis_weight": metadata["weight"],
                "tile_url": f"/api/land-structure/wms?provider={provider_id}",
            }
        )
    return layers


def infer_land_structure(zone: dict[str, Any]) -> dict[str, Any]:
    cache_key = _cache_key(zone)
    cached = _read_cache().get(cache_key)
    if cached and time.time() - float(cached.get("timestamp", 0)) < SATELLITE_CACHE_TTL_SECONDS:
        return cached["payload"]

    provider_results: list[dict[str, Any]] = []
    for provider_id, metadata in SATELLITE_LAYERS.items():
        if metadata["weight"] <= 0:
            continue
        try:
            provider_results.append(_analysis_for_provider(zone, provider_id))
        except requests.RequestException:
            continue

    if not provider_results:
        payload = _fallback_structure(zone)
        cache = _read_cache()
        cache[cache_key] = {"timestamp": time.time(), "payload": payload}
        _write_cache(cache)
        return payload

    blended = _blend_family_mixes(provider_results)
    agreement = _analysis_agreement(provider_results)
    confidence_breakdown = _confidence_breakdown(provider_results, agreement)
    confidence = confidence_breakdown["combined"]
    classification = _land_classification(blended)
    feasibility_score = _land_feasibility_score(blended, confidence)
    measures = _suggest_measures(classification, blended)

    payload = {
        "analysis_mode": "satellite_raster",
        "sources": {
            result["provider_id"]: {
                "provider": result["provider"],
                "label": result["label"],
                "layer": result["layer"],
                "analysis": result["analysis"],
                "weight": result["weight"],
                "opacity": result["opacity"],
                "sample_count": result["sample_count"],
                "dominant_class": result["dominant_class"],
                "confidence": result["confidence"],
                "family_mix": result["family_mix"],
            }
            for result in provider_results
        },
        "blended_land_cover_mix": blended,
        "confidence": confidence,
        "confidence_breakdown": confidence_breakdown,
        "land_feasibility_score": feasibility_score,
        "land_classification": classification,
        "measures": measures,
        "sample_count": sum(result["sample_count"] for result in provider_results),
        "map_layers": get_land_map_layers(),
        "legend": get_land_legend(),
    }

    cache = _read_cache()
    cache[cache_key] = {"timestamp": time.time(), "payload": payload}
    _write_cache(cache)
    return payload
