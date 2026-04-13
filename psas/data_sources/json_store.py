from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from psas.constants import DATA_DIR


def load_json_file(filename: str) -> list[dict[str, Any]]:
    with (DATA_DIR / filename).open("r", encoding="utf-8") as file:
        return json.load(file)


def load_optional_json_file(filename: str) -> list[dict[str, Any]] | None:
    path = DATA_DIR / filename
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_json_file(filename: str, payload: list[dict[str, Any]]) -> Path:
    path = DATA_DIR / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2, ensure_ascii=True)
    return path
