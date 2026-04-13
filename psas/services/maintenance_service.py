"""Maintenance Alert System - predictive care alerts for planted trees."""
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json
import os
import random


MAINTENANCE_LOG_FILE = "data/maintenance_log.json"
WEATHER_API_CACHE = "data/weather_forecast.json"


def load_maintenance_log() -> Dict:
    """Load maintenance event log."""
    if os.path.exists(MAINTENANCE_LOG_FILE):
        with open(MAINTENANCE_LOG_FILE, "r") as f:
            return json.load(f)
    
    return {
        "trees": {},
        "alerts": [],
        "completed_maintenance": []
    }


def save_maintenance_log(log: Dict) -> None:
    """Save maintenance log."""
    os.makedirs("data", exist_ok=True)
    with open(MAINTENANCE_LOG_FILE, "w") as f:
        json.dump(log, f, indent=2, default=str)


def get_simulated_weather_forecast(zone_id: str, days: int = 14) -> List[Dict]:
    """Get simulated weather forecast for maintenance prediction."""
    # In production, integrate with real weather API
    forecast = []
    
    base_temp = 28
    base_rainfall = 0
    
    for d in range(days):
        temp = base_temp + random.randint(-5, 5)
        rainfall = random.choice([0, 0, 0, 0, 0, 5, 10, 15])  # Monsoon simulation
        humidity = 60 + random.randint(-10, 20)
        
        forecast.append({
            "date": (datetime.now() + timedelta(days=d)).isoformat(),
            "temperature": temp,
            "rainfall_mm": rainfall,
            "humidity_percent": humidity,
            "risk_level": "HIGH" if humidity > 80 and temp > 30 else "LOW"
        })
    
    return forecast


def predict_maintenance_needs(species: Dict, zone_id: str, age_months: int) -> List[Dict[str, Any]]:
    """Predict maintenance needs based on weather and tree age."""
    forecast = get_simulated_weather_forecast(zone_id, 14)
    alerts = []
    
    # Pest risk based on humidity & temperature
    high_humidity_days = len([d for d in forecast if d["humidity_percent"] > 75])
    if high_humidity_days > 3:
        alerts.append({
            "alert_type": "pest_risk",
            "severity": "MEDIUM" if high_humidity_days > 5 else "LOW",
            "description": f"High humidity ({high_humidity_days} days) increases fungal/pest risk",
            "action": "Inspect leaves weekly, apply neem oil if symptoms appear",
            "target_days": [d["date"] for d in forecast if d["humidity_percent"] > 75][:3]
        })
    
    # Drought stress based on rainfall
    low_rainfall_window = len([d for d in forecast if d["rainfall_mm"] < 1])
    if low_rainfall_window > 7 and age_months < 12:
        alerts.append({
            "alert_type": "drought_stress",
            "severity": "CRITICAL" if age_months < 6 else "MEDIUM",
            "description": f"Extended dry period ({low_rainfall_window} days) - young tree at risk",
            "action": "Water deeply every 2-3 days, mulch to retain moisture",
            "target_days": list(range(7))
        })
    
    # Pruning schedule
    if age_months > 6 and age_months % 3 == 0:
        alerts.append({
            "alert_type": "pruning_due",
            "severity": "LOW",
            "description": "Regular structural pruning overdue",
            "action": "Remove dead branches, shape canopy, improve air circulation",
            "target_days": [0]
        })
    
    # Nutrient refill (annual)
    if age_months > 0 and age_months % 12 == 0:
        alerts.append({
            "alert_type": "nutrient_refill",
            "severity": "LOW",
            "description": "Annual nutrient replenishment",
            "action": f"Add 5kg compost, apply balanced fertilizer (10:10:10)",
            "target_days": [0]
        })
    
    return alerts


def generate_maintenance_calendar(species: Dict, zone_id: str, plant_date: str) -> Dict[str, Any]:
    """Generate 12-month maintenance calendar for a species."""
    plant_datetime = datetime.fromisoformat(plant_date)
    calendar = {}
    
    for month in range(1, 13):
        target_date = plant_datetime + timedelta(days=30 * month)
        age_months = month
        
        tasks = []
        
        # Month 1-2: Establishment
        if month <= 2:
            tasks = ["Daily watering", "Monitor growth", "Remove competing weeds"]
        
        # Month 3: First inspection
        elif month == 3:
            tasks = ["Inspect for pests", "Light pruning", "Check stake/tie"]
        
        # Month 4-6: Growth phase
        elif month <= 6:
            tasks = ["Bi-weekly watering", "Remove dead branches", "Check nutrient levels"]
        
        # Month 7-9: Monsoon care
        elif month <= 9:
            tasks = ["Monitor drainage", "Reduce watering if heavy rain", "Check for diseases"]
        
        # Month 10-12: Season transition
        else:
            tasks = ["Annual nutrient application", "Major pruning", "Inspect overall health"]
        
        calendar[f"month_{month}"] = {
            "target_date": target_date.isoformat(),
            "age_months": age_months,
            "tasks": tasks,
            "priority": "CRITICAL" if month <= 2 else "HIGH" if month in [3, 7, 12] else "NORMAL"
        }
    
    return calendar


def log_maintenance_activity(tree_id: str, activity_type: str, notes: str = "") -> Dict:
    """Log a completed maintenance activity."""
    log = load_maintenance_log()
    
    activity = {
        "timestamp": datetime.now().isoformat(),
        "tree_id": tree_id,
        "activity_type": activity_type,
        "notes": notes,
        "completed": True
    }
    
    log["completed_maintenance"].append(activity)
    save_maintenance_log(log)
    
    return activity


def get_tree_health_status(tree_id: str, age_months: int) -> Dict[str, Any]:
    """Get overall health status of a tree."""
    log = load_maintenance_log()
    
    tree_activities = [a for a in log["completed_maintenance"] if a["tree_id"] == tree_id]
    
    # Simple health scoring
    health_score = 80  # Base
    health_score -= max(0, (14 - age_months) * 5)  # Penalty if very young
    health_score -= len([a for a in tree_activities if "pest" in a["activity_type"]]) * 5
    
    return {
        "tree_id": tree_id,
        "age_months": age_months,
        "health_score": max(0, min(100, health_score)),
        "maintenance_count": len(tree_activities),
        "last_activity": tree_activities[-1]["timestamp"] if tree_activities else "No records"
    }
