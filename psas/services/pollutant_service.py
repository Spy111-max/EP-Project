"""Pollutant-Specific Prescriptions - target recommendations for specific pollutants."""
from typing import Dict, List, Any


POLLUTANT_WEIGHTS = {
    "pm25": 0.4,      # Most harmful
    "pm10": 0.15,
    "nox": 0.2,       # NOx is major in Delhi
    "sox": 0.1,
    "co2": 0.15
}


def analyze_pollutant_profile(zone: Dict) -> Dict[str, float]:
    """Analyze which pollutants dominate in a zone."""
    hotspot = zone
    aqi = hotspot.get("aqi", {})
    
    profile = {
        "pm25": aqi.get("pm25", 0),
        "pm10": aqi.get("pm10", 0),
        "nox": aqi.get("nox", 0),
        "sox": aqi.get("sox", 0),
        "co2": aqi.get("co2", 0)
    }
    
    total = sum(profile.values())
    if total == 0:
        return {p: 0 for p in profile}
    
    # Normalize to percentages
    return {p: (v / total) * 100 for p, v in profile.items()}


def score_species_for_pollutant(species: Dict, target_pollutant: str) -> float:
    """Score how effective a species is for a specific pollutant."""
    absorption = species.get("absorption", {})
    
    # Base absorption for target pollutant
    target_absorption = absorption.get(target_pollutant, 0)
    
    # Bonus for species that absorb multiple pollutants well
    total_absorption = sum(absorption.values())
    diversity_bonus = 0.1 if total_absorption > 2 else 0
    
    return target_absorption + diversity_bonus


def prescribe_for_pollutant(species_catalog: List[Dict], zone: Dict, target_pollutant: str) -> List[Dict[str, Any]]:
    """Recommend species specifically targeted at a pollutant."""
    if target_pollutant not in ["pm25", "pm10", "nox", "sox", "co2"]:
        return []
    
    # Score all species for this pollutant
    scored = []
    for species in species_catalog:
        score = score_species_for_pollutant(species, target_pollutant)
        if score > 0:
            scored.append({
                "species": species["common_name"],
                "pollutant_target": target_pollutant,
                "effectiveness_score": round(score, 3),
                "absorption_kg_year": round(species.get("absorption", {}).get(target_pollutant, 0), 3),
                "co_benefits": [p for p in ["pm25", "pm10", "nox", "sox", "co2"] 
                               if species.get("absorption", {}).get(p, 0) > 0 and p != target_pollutant]
            })
    
    # Sort by effectiveness
    scored.sort(key=lambda x: x["effectiveness_score"], reverse=True)
    return scored[:10]


def create_multipart_prescription(species_catalog: List[Dict], zone: Dict) -> Dict[str, Any]:
    """Create a multi-part prescription targeting all major pollutants."""
    profile = analyze_pollutant_profile(zone)
    
    # Identify top 3 pollutants
    top_pollutants = sorted(profile.items(), key=lambda x: x[1], reverse=True)[:3]
    
    prescription = {
        "zone_id": zone["zone_id"],
        "primary_issue": top_pollutants[0][0],
        "issue_severity": {p: v for p, v in top_pollutants},
        "recommendations_by_pollutant": {}
    }
    
    for pollutant, severity in top_pollutants:
        recommendations = prescribe_for_pollutant(species_catalog, zone, pollutant)
        prescription["recommendations_by_pollutant"][pollutant] = {
            "target": pollutant,
            "severity_percentage": round(severity, 1),
            "top_species": recommendations[:5]
        }
    
    # Suggest "synergy team" - species that cover all top pollutants
    all_recommendations = []
    for _, data in prescription["recommendations_by_pollutant"].items():
        all_recommendations.extend(data["top_species"])
    
    # Deduplicate and get top 10 diverse species
    unique_species = {r["species"]: r for r in all_recommendations}
    prescription["synergy_team"] = list(unique_species.values())[:10]
    
    return prescription
