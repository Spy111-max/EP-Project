from __future__ import annotations

import copy
from typing import Any

import requests


DENSE_FRIENDLY_COMMON_NAMES = {
    "ashoka (false)",
    "bamboo",
    "butea monosperma",
    "cassia fistula",
    "delonix regia",
    "drumstick tree",
    "kachnar",
    "karanj",
    "lemon",
    "malabar neem",
    "moringa oleifera",
    "neem",
    "palash",
    "pongamia pinnata",
    "siris",
    "subabul",
}

OPEN_ONLY_COMMON_NAMES = {
    "arjun",
    "banyan",
    "ficus benghalensis",
    "ficus religiosa",
    "jackfruit",
    "jamun",
    "mahogany",
    "mahua",
    "mango",
    "peepal",
    "shisham",
    "teak",
}


def _site_class_for_zone(zone_type: str | None) -> str:
    if zone_type in {"industrial", "traffic"}:
        return "dense"
    if zone_type == "residential":
        return "balanced"
    return "open"


def _preferred_site_classes(species: dict[str, Any]) -> list[str]:
    common = str(species.get("common_name", "")).strip().lower()
    scientific = str(species.get("scientific_name", "")).strip().lower()
    growth_years = int(species.get("growth_years", 0) or 0)
    growth_category = species.get("growth_category")

    if common in OPEN_ONLY_COMMON_NAMES or scientific in OPEN_ONLY_COMMON_NAMES:
        return ["open"]

    if common in DENSE_FRIENDLY_COMMON_NAMES or scientific in DENSE_FRIENDLY_COMMON_NAMES:
        return ["dense", "balanced"]

    if growth_category == "fast" and growth_years <= 5:
        return ["dense", "balanced"]

    if growth_years <= 10:
        return ["balanced", "open"]

    return ["open", "balanced"]


def _canopy_class(species: dict[str, Any]) -> str:
    growth_years = int(species.get("growth_years", 0) or 0)
    if growth_years <= 5:
        return "compact"
    if growth_years <= 10:
        return "medium"
    return "large"


def _aqi_vector_from_open_meteo(payload: dict[str, Any]) -> dict[str, float]:
    current = payload.get("current", {})
    pm25 = float(current.get("pm2_5", 0.0) or 0.0)
    pm10 = float(current.get("pm10", 0.0) or 0.0)
    no2 = float(current.get("nitrogen_dioxide", 0.0) or 0.0)
    so2 = float(current.get("sulphur_dioxide", 0.0) or 0.0)
    co = float(current.get("carbon_monoxide", 0.0) or 0.0)

    return {
        "pm25": round(pm25, 2),
        "pm10": round(pm10, 2),
        "nox": round(no2, 2),
        "sox": round(so2, 2),
        "co2": round(co * 1.8, 2),
    }


def fetch_open_meteo_air_quality(latitude: float, longitude: float) -> dict[str, float] | None:
    endpoint = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi",
        "timezone": "auto",
    }

    response = requests.get(endpoint, params=params, timeout=12)
    response.raise_for_status()
    return _aqi_vector_from_open_meteo(response.json())


def build_micro_hotspots(hotspots: list[dict[str, Any]], samples_per_zone: int = 3) -> list[dict[str, Any]]:
    offsets_by_site_class = {
        "dense": [(0.0009, 0.0009), (0.0012, -0.0008), (-0.0011, 0.0007)],
        "balanced": [(0.0022, 0.0018), (-0.002, 0.0013), (0.0015, -0.0021)],
        "open": [(0.004, 0.0035), (-0.0035, 0.004), (0.005, -0.003)],
    }

    micro_hotspots: list[dict[str, Any]] = []
    for zone in hotspots:
        site_class = _site_class_for_zone(zone.get("zone_type"))
        offsets = offsets_by_site_class[site_class][:samples_per_zone]

        base = copy.deepcopy(zone)
        base["site_class"] = site_class
        base["source"] = "local"
        micro_hotspots.append(base)

        for index, (lat_offset, lon_offset) in enumerate(offsets, start=1):
            latitude = float(zone["lat"]) + lat_offset
            longitude = float(zone["lon"]) + lon_offset

            pollution = fetch_open_meteo_air_quality(latitude, longitude)
            if pollution is None:
                continue

            micro_hotspots.append(
                {
                    **copy.deepcopy(zone),
                    "id": f"{zone['id']}-micro-{index}",
                    "zone_id": f"{zone['id']}-micro-{index}",
                    "name": f"{zone['name']} Micro Area {index}",
                    "lat": round(latitude, 6),
                    "lon": round(longitude, 6),
                    "latitude": round(latitude, 6),
                    "longitude": round(longitude, 6),
                    "site_class": site_class,
                    "source": "open-meteo",
                    "pollution": pollution,
                }
            )

    return micro_hotspots


def enrich_species_catalog(species_catalog: list[dict[str, Any]]) -> list[dict[str, Any]]:
    session = requests.Session()
    session.headers.update({"User-Agent": "EP-Project/1.0 (species enrichment)"})

    enriched_catalog: list[dict[str, Any]] = []
    for species in species_catalog:
        scientific_name = species.get("scientific_name") or species.get("common_name")
        gbif_payload: dict[str, Any] | None = None

        try:
            response = session.get(
                "https://api.gbif.org/v1/species/search",
                params={"q": scientific_name, "limit": 1},
                timeout=12,
            )
            response.raise_for_status()
            results = response.json().get("results", [])
            if results:
                record = results[0]
                gbif_payload = {
                    "key": record.get("key"),
                    "canonicalName": record.get("canonicalName"),
                    "family": record.get("family"),
                    "genus": record.get("genus"),
                    "taxonomicStatus": record.get("taxonomicStatus"),
                    "vernacularNames": [
                        item.get("vernacularName")
                        for item in record.get("vernacularNames", [])
                        if item.get("vernacularName")
                    ][:5],
                }
        except requests.RequestException:
            gbif_payload = None

        enriched = {
            **copy.deepcopy(species),
            "preferred_site_classes": _preferred_site_classes(species),
            "canopy_class": _canopy_class(species),
        }
        if gbif_payload:
            enriched["gbif"] = gbif_payload
        enriched_catalog.append(enriched)

    return enriched_catalog
