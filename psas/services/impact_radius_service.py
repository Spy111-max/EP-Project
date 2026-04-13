"""Impact Radius Visualizer - geographic spread of air quality improvement."""
from typing import Dict, List, Any
import math


def calculate_impact_radius(species: Dict, quantity: int = 1) -> float:
    """Calculate geographic impact radius of trees."""
    # Base radius 500m per tree
    base_radius = 500
    
    # Larger, mature trees have wider impact
    if species.get("growth_category") == "large":
        base_radius *= 1.3
    elif species.get("growth_category") == "small":
        base_radius *= 0.7
    
    # Height factor
    max_height = float(species.get("max_height", "10").split("m")[0])
    height_factor = max_height / 10
    
    # Crown spread factor
    crown_spread = species.get("crown_spread_m", 8)
    spread_factor = crown_spread / 8
    
    # Combine factors
    total_radius = base_radius * height_factor * spread_factor * math.sqrt(quantity)
    
    return round(min(total_radius, 2000), 0)  # Cap at 2km


def generate_impact_heatmap_points(zone: Dict, species_catalog: List[Dict], recommendations: List[Dict]) -> List[Dict[str, Any]]:
    """Generate heatmap points showing air quality improvement zones."""
    # Zone center (simplified coordinates)
    zone_lat = float(zone.get("latitude", 28.7))
    zone_lon = float(zone.get("longitude", 77.1))
    
    heatmap = []
    
    for rec in recommendations:
        species = next((s for s in species_catalog if s["common_name"] == rec["common_name"]), None)
        if not species:
            continue
        
        qty = rec.get("recommended_count", 10)
        radius = calculate_impact_radius(species, qty)
        
        # Generate concentric circles of impact
        for ring in range(0, int(radius), 250):
            distance_pct = ring / radius if radius > 0 else 0
            impact_intensity = max(0, 1 - distance_pct)  # Exponential decay
            
            # Generate points around circle
            for angle in range(0, 360, 45):  # 8 points per ring
                rad = math.radians(angle)
                lat = zone_lat + (ring / 111000) * math.cos(rad)  # 1 degree ~ 111km
                lon = zone_lon + (ring / 111000) * math.sin(rad) / math.cos(math.radians(zone_lat))
                
                heatmap.append({
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "intensity": round(impact_intensity, 2),
                    "source_species": species["common_name"],
                    "pm25_reduction_percent": round(impact_intensity * species.get("absorption", {}).get("pm25", 0.5) * 100, 1),
                    "distance_m": ring
                })
    
    return heatmap


def project_cumulative_impact(zone: Dict, species_catalog: List[Dict], recommendations: List[Dict], years: int = 10) -> List[Dict[str, Any]]:
    """Project cumulative air quality improvement over time and distance."""
    projection = []
    
    base_aqi = zone.get("aqi", {}).get("pm25", 100)
    
    for year in range(0, years + 1):
        # Tree growth increases impact
        maturity_factor = min(1.0, year / 5)  # Reach full maturity at year 5
        
        # Calculate zone-wide improvement
        total_absorption = 0
        for rec in recommendations:
            species = next((s for s in species_catalog if s["common_name"] == rec["common_name"]), None)
            if species:
                yearly_absorption = species.get("absorption", {}).get("pm25", 0.5)
                qty = rec.get("recommended_count", 10)
                total_absorption += yearly_absorption * qty * maturity_factor
        
        # Convert absorption to AQI improvement
        aqi_improvement = total_absorption * 0.3  # Rough conversion
        projected_aqi = max(base_aqi - aqi_improvement, 50)
        
        # Generate sample points at different distances
        sample_distances = [0, 500, 1000, 1500, 2000]
        distance_impacts = {}
        
        for dist in sample_distances:
            # Exponential decay with distance
            decay = math.exp(-dist / 1000) if dist > 0 else 1.0
            intensity = aqi_improvement * decay
            distance_impacts[f"{dist}m"] = round(intensity, 2)
        
        projection.append({
            "year": year,
            "zone_aqi_pm25": round(projected_aqi, 1),
            "improvement_from_baseline": round(aqi_improvement, 1),
            "tree_maturity_percent": round(maturity_factor * 100, 1),
            "distance_based_impact": distance_impacts,
            "zone_coverage_percent": min(100, round((aqi_improvement / base_aqi * 100), 1))
        })
    
    return projection


def create_impact_visualization_data(zone: Dict, species_catalog: List[Dict], recommendations: List[Dict]) -> Dict[str, Any]:
    """Create complete visualization data for impact radius display."""
    heatmap_points = generate_impact_heatmap_points(zone, species_catalog, recommendations)
    impacts = project_cumulative_impact(zone, species_catalog, recommendations, 10)
    
    # Calculate summary stats
    unique_species = set(rec["common_name"] for rec in recommendations)
    total_trees = sum(rec.get("recommended_count", 10) for rec in recommendations)
    max_radius = max([calculate_impact_radius(
        next(s for s in species_catalog if s["common_name"] == rec["common_name"]), 
        rec.get("recommended_count", 10)
    ) for rec in recommendations], default=0)
    
    return {
        "zone_id": zone["zone_id"],
        "zone_center": {
            "latitude": zone.get("latitude", 28.7),
            "longitude": zone.get("longitude", 77.1)
        },
        "heatmap_data": heatmap_points,
        "impact_projection_10_year": impacts,
        "summary": {
            "species_diversity": len(unique_species),
            "total_trees": total_trees,
            "max_impact_radius_m": round(max_radius, 0),
            "baseline_pm25": zone.get("aqi", {}).get("pm25", 100),
            "projected_pm25_year10": round(impacts[-1]["zone_aqi_pm25"], 1),
            "total_pm25_reduction_year10": round(impacts[-1]["improvement_from_baseline"], 1)
        }
    }


def identify_vulnerable_zones(zone: Dict, species_catalog: List[Dict]) -> List[Dict[str, Any]]:
    """Identify sub-zones within a zone that need additional tree coverage."""
    # Simulate neighborhood-level pollution variation
    sub_zones = []
    
    base_pollution = zone.get("aqi", {}).get("pm25", 100)
    
    for i in range(9):  # 3x3 grid
        sub_pollution = base_pollution + (i % 3) * 15 + (i // 3) * 20
        
        if sub_pollution > base_pollution + 30:  # Hotspot
            high_absorbers = [s for s in species_catalog 
                            if s.get("absorption", {}).get("pm25", 0) > 0.7][:3]
            
            sub_zones.append({
                "sub_zone_id": f"zone-{i}",
                "pollution_level": sub_pollution,
                "priority": "CRITICAL",
                "recommended_species": [s["common_name"] for s in high_absorbers],
                "urgency_radius_covered": 0
            })
    
    return sub_zones
