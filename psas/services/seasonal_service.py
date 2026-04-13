"""Seasonal Planting Advisor - optimal planting windows and soil prep."""
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json
import os


PLANTING_CALENDAR_FILE = "data/planting_calendar.json"


def load_planting_calendar() -> Dict:
    """Load planting calendar data."""
    if os.path.exists(PLANTING_CALENDAR_FILE):
        with open(PLANTING_CALENDAR_FILE, "r") as f:
            return json.load(f)
    
    return {
        "regions": {
            "north": {"monsoon_start": 6, "monsoon_end": 9, "best_months": [7, 8, 9]},
            "south": {"monsoon_start": 5, "monsoon_end": 10, "best_months": [6, 7, 8]},
            "east": {"monsoon_start": 6, "monsoon_end": 9, "best_months": [7, 8]},
            "west": {"monsoon_start": 6, "monsoon_end": 9, "best_months": [7, 8, 9]},
            "central": {"monsoon_start": 6, "monsoon_end": 9, "best_months": [7, 8]}
        }
    }


def get_optimal_planting_window(species: Dict, zone: Dict) -> Dict[str, Any]:
    """Get optimal planting window for a species in a zone."""
    calendar = load_planting_calendar()
    
    # Determine region (simplified - map zone to region)
    zone_id = zone.get("zone_id", "")
    region = "north" if any(x in zone_id for x in ["delhi", "chandigarh", "jaipur", "lucknow", "kanpur"]) else \
             "south" if any(x in zone_id for x in ["bangalore", "hyderabad", "pune", "kochi", "chennai"]) else \
             "central"
    
    region_data = calendar["regions"].get(region, calendar["regions"]["north"])
    
    # Species-specific preferences
    prefers_dry = species.get("soil_moisture_preference") == "dry"
    prefers_high_rainfall = species.get("soil_moisture_preference") == "wet"
    
    best_months = region_data["best_months"].copy()
    
    if prefers_high_rainfall:
        best_months = [m for m in best_months if region_data["monsoon_start"] <= m <= region_data["monsoon_end"]]
    elif prefers_dry:
        best_months = [m for m in best_months if m < region_data["monsoon_start"] or m > region_data["monsoon_end"]]
    
    if not best_months:
        best_months = region_data["best_months"]
    
    month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    return {
        "species": species.get("common_name"),
        "zone": zone.get("zone_id"),
        "region": region,
        "optimal_months": [month_names[m] for m in sorted(best_months)],
        "month_numbers": best_months,
        "soil_preparation_days": 14,
        "soil_prep_tasks": [
            "Clear weeds and debris",
            "Add 5kg compost per sapling",
            "Check soil pH (target: 6-7.5)" if 5 <= species.get("soil_ph_target", 7) <= 8 else "Adjust pH if needed",
            "Ensure drainage",
            "Create planting pit (60cm x 60cm x 60cm)"
        ],
        "watering_frequency_weeks": 2,
        "first_year_care": [
            "Water every 2 weeks during dry season",
            "Mulch around sapling (6-8cm)",
            "Monitor for pests",
            "Apply growth stimulant at 6 weeks"
        ]
    }


def get_region_planting_schedule(region: str, species_catalog: List[Dict]) -> List[Dict[str, Any]]:
    """Get full planting schedule for a region."""
    calendar = load_planting_calendar()
    region_data = calendar["regions"].get(region, calendar["regions"]["north"])
    
    schedule = []
    for month in range(1, 13):
        month_names = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        
        is_optimal = month in region_data["best_months"]
        is_monsoon = region_data["monsoon_start"] <= month <= region_data["monsoon_end"]
        
        suitable_species = []
        if is_optimal or is_monsoon:
            suitable_species = [s["common_name"] for s in species_catalog[:5]]  # Top 5 adaptive species
        
        schedule.append({
            "month": month,
            "month_name": month_names[month],
            "is_optimal": is_optimal,
            "is_monsoon": is_monsoon,
            "suitable_species": suitable_species,
            "tasks": _get_monthly_tasks(month, region_data)
        })
    
    return schedule


def _get_monthly_tasks(month: int, region_data: Dict) -> List[str]:
    """Get tasks to do in a specific month."""
    tasks = []
    
    if month in region_data["best_months"]:
        tasks.append("High-priority planting month")
        tasks.append("Prepare pits for saplings")
    
    if month == region_data["monsoon_start"]:
        tasks.append("Monsoon prep: Clean drainage")
        tasks.append("Stock up on saplings")
    
    if month == region_data["monsoon_end"] + 1:
        tasks.append("Post-monsoon inspection")
        tasks.append("Fill gaps with failed saplings")
    
    if month % 3 == 0:
        tasks.append("Prune & trim canopy")
        tasks.append("Check nutrient levels")
    
    return tasks if tasks else ["Regular maintenance"]


def suggest_species_for_month(species_catalog: List[Dict], region: str, target_month: int) -> List[Dict[str, Any]]:
    """Suggest best species to plant in a specific month/region."""
    suitable = []
    
    for species in species_catalog:
        # Check climate window
        c_min, c_max = species.get("climate_window", (15, 35))
        
        # Rough seasonal temps (simplified)
        seasonal_temps = {
            1: 20, 2: 22, 3: 28, 4: 32, 5: 35, 6: 33,
            7: 30, 8: 29, 9: 32, 10: 30, 11: 25, 12: 22
        }
        
        month_temp = seasonal_temps.get(target_month, 25)
        
        if c_min <= month_temp <= c_max:
            suitable.append({
                "species": species["common_name"],
                "suitability_score": 0.8 if c_min <= month_temp <= c_max else 0.5,
                "care_level": species.get("growth_category", "medium"),
                "time_to_first_benefit": species.get("years_to_maturity", 5)
            })
    
    return sorted(suitable, key=lambda x: x["suitability_score"], reverse=True)
