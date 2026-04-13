"""Growth Timeline Simulator - project PM2.5 reduction over time."""
from typing import Dict, List, Any
import math


def project_tree_growth(species: Dict, years: int = 10) -> List[Dict[str, Any]]:
    """Project tree growth and PM2.5 absorption over years."""
    timeline = []
    
    # Absorption starts low, increases with tree maturity
    max_pm25_absorption = species.get("absorption", {}).get("pm25", 0.5)
    
    for year in range(0, years + 1):
        # Sigmoidal growth curve: slow start, rapid growth, maturity plateau
        growth_factor = 1 / (1 + math.exp(-0.5 * (year - 5)))  # S-curve centered at year 5
        
        pm25_absorption_year = max_pm25_absorption * growth_factor
        carbon_seq = species.get("carbon_sequestration_kg_year", 15)
        
        # Carbon seq also increases with maturity
        carbon_seq_year = carbon_seq * growth_factor
        
        timeline.append({
            "year": year,
            "tree_height": f"{0.2 + 6 * growth_factor:.1f}m",
            "pm25_absorption_kg_year": round(pm25_absorption_year, 3),
            "carbon_sequestration_kg_year": round(carbon_seq_year, 2),
            "maturity": round(growth_factor * 100, 1)
        })
    
    return timeline


def project_zone_impact(recommendations: List[Dict], quantity_per_species: Dict, years: int = 10) -> Dict[str, Any]:
    """Project cumulative PM2.5 reduction for a zone over time."""
    timeline = []
    
    for year in range(0, years + 1):
        cumulative_pm25_reduction = 0
        total_carbon_seq = 0
        
        for rec in recommendations:
            species = rec.get("species_data", {})
            qty = quantity_per_species.get(rec["common_name"], 0)
            
            max_absorption = species.get("absorption", {}).get("pm25", 0.5)
            growth_factor = 1 / (1 + math.exp(-0.5 * (year - 5)))
            
            annual_reduction = max_absorption * growth_factor * qty
            annual_carbon = species.get("carbon_sequestration_kg_year", 15) * growth_factor * qty
            
            cumulative_pm25_reduction += annual_reduction
            total_carbon_seq += annual_carbon
        
        timeline.append({
            "year": year,
            "pm25_reduction_kg": round(cumulative_pm25_reduction, 2),
            "carbon_sequestration_kg": round(total_carbon_seq, 2),
            "estimated_aqi_improvement": round(cumulative_pm25_reduction * 0.3, 1)  # Rough conversion
        })
    
    return {
        "zone_impact_10_year": timeline,
        "final_pm25_reduction": timeline[-1]["pm25_reduction_kg"] if timeline else 0,
        "total_carbon_captured": sum(t["carbon_sequestration_kg"] for t in timeline)
    }


def compare_scenarios(zone: Dict, scenarios: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Compare different planting scenarios side-by-side."""
    comparisons = []
    
    for scenario in scenarios:
        result = project_zone_impact(scenario["recommendations"], scenario["quantities"], 10)
        comparisons.append({
            "scenario_name": scenario["name"],
            "budget": scenario.get("budget", "unknown"),
            "tree_count": sum(scenario["quantities"].values()),
            **result
        })
    
    return comparisons
