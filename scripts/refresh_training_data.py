from __future__ import annotations

import json
from pathlib import Path

from psas.constants import DATA_DIR, ENRICHED_DATA_DIR
from psas.data_sources.aqi_data import get_hotspots
from psas.data_sources.json_store import save_json_file
from psas.data_sources.tree_data import get_species_catalog
from psas.data_sources.trusted_data import build_micro_hotspots, enrich_species_catalog


def main() -> None:
    hotspots = get_hotspots()
    species_catalog = get_species_catalog()

    micro_hotspots = build_micro_hotspots(hotspots)
    enriched_species = enrich_species_catalog(species_catalog)

    ENRICHED_DATA_DIR.mkdir(parents=True, exist_ok=True)

    hotspots_path = save_json_file("enriched/hotspots_micro.json", micro_hotspots)
    species_path = save_json_file("enriched/species_enriched.json", enriched_species)

    manifest = {
        "hotspot_records": len(micro_hotspots),
        "species_records": len(enriched_species),
        "hotspots_path": str(hotspots_path.relative_to(DATA_DIR.parent)),
        "species_path": str(species_path.relative_to(DATA_DIR.parent)),
    }

    manifest_path = Path(DATA_DIR) / "enriched" / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()