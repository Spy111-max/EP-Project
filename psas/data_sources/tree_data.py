from __future__ import annotations

from typing import Any

from psas.data_sources.json_store import load_json_file, load_optional_json_file


def get_species_catalog() -> list[dict[str, Any]]:
    enriched = load_optional_json_file("enriched/species_enriched.json")
    return enriched if enriched else load_json_file("species.json")
