"""Species Synergy Engine - identify tree combinations that work well together."""
from typing import Dict, List, Any


def build_synergy_matrix(species_catalog: List[Dict]) -> Dict[str, Dict[str, float]]:
    """Build a synergy score matrix between all species pairs."""
    synergies = {}
    
    for sp1 in species_catalog:
        synergies[sp1["common_name"]] = {}
        for sp2 in species_catalog:
            if sp1 == sp2:
                synergies[sp1["common_name"]][sp2["common_name"]] = 0.0
                continue
            
            score = 0.0
            
            # Similar growth rates work well together
            if sp1.get("growth_category") == sp2.get("growth_category"):
                score += 0.2
            
            # Different absorption profiles complement each other
            sp1_absorption = [
                sp1.get("absorption", {}).get(p, 0) 
                for p in ["pm25", "pm10", "nox", "sox", "co2"]
            ]
            sp2_absorption = [
                sp2.get("absorption", {}).get(p, 0) 
                for p in ["pm25", "pm10", "nox", "sox", "co2"]
            ]
            
            # Correlation: lower = more diverse = better combo
            if sum(sp1_absorption) > 0 and sum(sp2_absorption) > 0:
                diff = sum(abs(a - b) for a, b in zip(sp1_absorption, sp2_absorption))
                diversity_score = min(diff / 100, 1.0)
                score += diversity_score * 0.3
            
            # Same soil type preference is good
            if set(sp1.get("soil_types", [])) & set(sp2.get("soil_types", [])):
                score += 0.15
            
            # Climate compatibility
            if sp1.get("climate_window") and sp2.get("climate_window"):
                c1_min, c1_max = sp1["climate_window"]
                c2_min, c2_max = sp2["climate_window"]
                overlap = max(0, min(c1_max, c2_max) - max(c1_min, c2_min))
                climate_compat = overlap / max(c1_max - c1_min, c2_max - c2_min, 1)
                score += climate_compat * 0.2
            
            # Light requirements: mix of canopy and understory is ideal
            light1 = sp1.get("light_requirement", "full")
            light2 = sp2.get("light_requirement", "full")
            if (light1 == "full" and light2 == "partial") or (light1 == "partial" and light2 == "full"):
                score += 0.15
            
            synergies[sp1["common_name"]][sp2["common_name"]] = min(score, 1.0)
    
    return synergies


def get_top_synergies(species_name: str, synergy_matrix: Dict, top_n: int = 5) -> List[Dict[str, Any]]:
    """Get top compatible species for a given species."""
    if species_name not in synergy_matrix:
        return []
    
    combos = synergy_matrix[species_name]
    sorted_combos = sorted(combos.items(), key=lambda x: x[1], reverse=True)
    
    return [
        {"partner_species": name, "synergy_score": score}
        for name, score in sorted_combos[:top_n]
        if score > 0
    ]


def score_trio_combination(species_trio: List[str], synergy_matrix: Dict) -> float:
    """Score how well three species work together."""
    if len(species_trio) != 3:
        return 0.0
    
    pairwise_scores = []
    for i in range(len(species_trio)):
        for j in range(i + 1, len(species_trio)):
            sp1, sp2 = species_trio[i], species_trio[j]
            if sp1 in synergy_matrix and sp2 in synergy_matrix[sp1]:
                pairwise_scores.append(synergy_matrix[sp1][sp2])
    
    return sum(pairwise_scores) / len(pairwise_scores) if pairwise_scores else 0.0


def recommend_synergy_combos(species_catalog: List[Dict], zone: Dict, top_combos: int = 5) -> List[Dict[str, Any]]:
    """Recommend top species combinations for a zone."""
    synergy_matrix = build_synergy_matrix(species_catalog)
    combos = []
    
    # Generate all possible trios
    for i in range(len(species_catalog)):
        for j in range(i + 1, len(species_catalog)):
            for k in range(j + 1, len(species_catalog)):
                trio = [
                    species_catalog[i]["common_name"],
                    species_catalog[j]["common_name"],
                    species_catalog[k]["common_name"]
                ]
                score = score_trio_combination(trio, synergy_matrix)
                combos.append({"species": trio, "synergy_score": score})
    
    combos = sorted(combos, key=lambda x: x["synergy_score"], reverse=True)
    return combos[:top_combos]
