from __future__ import annotations

from typing import Any

from psas.data_sources.json_store import load_optional_json_file


def get_pune_kothrud_planting_sites() -> list[dict[str, Any]]:
    data = load_optional_json_file("pune_kothrud_planting_sites.json")
    if not isinstance(data, list):
        return []
    return [item for item in data if isinstance(item, dict)]
