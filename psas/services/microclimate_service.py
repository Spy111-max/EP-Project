"""Microclimate Mapper - detect pollution hotspots within zones."""
from typing import Dict, List, Any
import math


def divide_zone_into_microclimate_blocks(zone: Dict, grid_size: int = 3) -> List[Dict[str, Any]]:
    """Divide a zone into microclimate blocks (3x3 grid = 9 blocks)."""
    blocks = []
    
    # Simulated zone boundaries (latitude/longitude range)
    lat_min, lat_max = 28.5, 28.8  # Example: Delhi range
    lon_min, lon_max = 77.0, 77.3
    
    lat_step = (lat_max - lat_min) / grid_size
    lon_step = (lon_max - lon_min) / grid_size
    
    for i in range(grid_size):
        for j in range(grid_size):
            lat = lat_min + i * lat_step + lat_step / 2
            lon = lon_min + j * lon_step + lon_step / 2
            
            # Simulate pollution variance within zone
            # Industrial areas, traffic corridors have higher pollution
            base_pollution = zone.get("aqi", {}).get("pm25", 100)
            
            # Traffic corridor simulation
            is_corridor = j == 1  # Middle column = main road effect
            pollution_variance = 1.3 if is_corridor else (0.7 if i == 2 else 1.0)
            
            block_pm25 = base_pollution * pollution_variance + (i * j * 5)  # Slight variance
            
            blocks.append({
                "block_id": f"block-{i}-{j}",
                "zone_id": zone["zone_id"],
                "grid_position": {"row": i, "col": j},
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "pm25": round(block_pm25, 1),
                "pm10": round(block_pm25 * 1.2, 1),
                "pollution_level": "HIGH" if block_pm25 > 150 else "MODERATE" if block_pm25 > 100 else "LOW",
                "characteristics": _identify_block_characteristics(i, j, zone),
                "recommended_species_focus": _get_species_for_block(block_pm25)
            })
    
    return blocks


def _identify_block_characteristics(row: int, col: int, zone: Dict) -> List[str]:
    """Identify block characteristics based on position."""
    characteristics = []
    
    if col == 1:  # Middle column (main road)
        characteristics.append("near_major_road")
    
    if row == 0:
        characteristics.append("near_commercial_area")
    elif row == 2:
        characteristics.append("residential_area")
    
    if (row + col) % 2 == 0:
        characteristics.append("industrial_influence")
    
    return characteristics


def _get_species_for_block(pm25_level: float) -> List[str]:
    """Recommend species based on pollution level."""
    if pm25_level > 150:
        return ["Neem", "Karanj", "Australian Acacia"]  # High PM2.5 absorbers
    elif pm25_level > 100:
        return ["Gulmohar", "Malabar Neem", "Drumstick"]  # Medium absorbers
    else:
        return ["Peepal", "Banyan", "Jamun"]  # Shade trees for clean areas


def get_microclimate_insights(zone: Dict, grid_size: int = 3) -> Dict[str, Any]:
    """Analyze microclimate variations within a zone."""
    blocks = divide_zone_into_microclimate_blocks(zone, grid_size)
    
    pm25_values = [b["pm25"] for b in blocks]
    
    return {
        "zone_id": zone["zone_id"],
        "blocks": blocks,
        "statistics": {
            "avg_pm25": round(sum(pm25_values) / len(pm25_values), 1),
            "max_pm25": max(pm25_values),
            "min_pm25": min(pm25_values),
            "variance": round(sum((x - sum(pm25_values)/len(pm25_values))**2 for x in pm25_values) / len(pm25_values), 1)
        },
        "hotspots": [b for b in blocks if b["pollution_level"] == "HIGH"],
        "clean_zones": [b for b in blocks if b["pollution_level"] == "LOW"],
        "strategy": "Prioritize trees with high PM2.5 absorption in hotspot blocks"
    }


def recommend_block_specific_combos(blocks: List[Dict], species_catalog: List[Dict]) -> List[Dict[str, Any]]:
    """Recommend species combinations for each block type."""
    combos = []
    
    for block in blocks:
        if block["pollution_level"] == "HIGH":
            selected = [s for s in species_catalog if s["common_name"] in ["Neem", "Karanj", "Australian Acacia"]][:1]
        elif block["pollution_level"] == "MODERATE":
            selected = [s for s in species_catalog if s["common_name"] in ["Gulmohar", "Malabar Neem", "Drumstick"]][:1]
        else:
            selected = [s for s in species_catalog if s["common_name"] in ["Peepal", "Banyan", "Jamun"]][:1]
        
        if selected:
            combos.append({
                "block_id": block["block_id"],
                "pollution_level": block["pollution_level"],
                "species": selected[0]["common_name"],
                "priority": "CRITICAL" if block["pollution_level"] == "HIGH" else "NORMAL"
            })
    
    return combos
