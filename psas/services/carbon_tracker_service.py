"""Carbon Economy Tracker - gamified carbon credit system."""
from datetime import datetime
from typing import Dict, List, Any
import json
import os


CARBON_LEDGER_FILE = "data/carbon_ledger.json"


def load_carbon_ledger() -> Dict[str, Any]:
    """Load carbon credit ledger."""
    if os.path.exists(CARBON_LEDGER_FILE):
        with open(CARBON_LEDGER_FILE, "r") as f:
            return json.load(f)
    return {
        "total_credits": 0,
        "zones": {},
        "transactions": [],
        "leaderboard": {}
    }


def save_carbon_ledger(ledger: Dict) -> None:
    """Save carbon credit ledger."""
    os.makedirs("data", exist_ok=True)
    with open(CARBON_LEDGER_FILE, "w") as f:
        json.dump(ledger, f, indent=2, default=str)


def calculate_tree_credits(species: Dict, years: int = 1) -> float:
    """Calculate carbon credits earned per tree per year."""
    # Base: kg CO2 sequestered per year
    base_credits = species.get("carbon_sequestration_kg_year", 15)
    
    # Mature trees (10+ years) sequester more
    if years >= 10:
        base_credits *= 1.5
    elif years >= 5:
        base_credits *= 1.2
    
    # Convert kg CO2 to credits (1 credit = 1 kg CO2)
    return base_credits


def plant_tree(zone_id: str, species_name: str, quantity: int = 1) -> Dict[str, Any]:
    """Record tree planting and award carbon credits."""
    ledger = load_carbon_ledger()
    
    if zone_id not in ledger["zones"]:
        ledger["zones"][zone_id] = {
            "trees_planted": 0,
            "credits_earned": 0,
            "plantings": []
        }
    
    credits_per_tree = 15  # Base annual carbon sequestration
    total_credits = credits_per_tree * quantity
    
    transaction = {
        "timestamp": datetime.now().isoformat(),
        "zone": zone_id,
        "species": species_name,
        "quantity": quantity,
        "credits_awarded": total_credits,
        "type": "planting"
    }
    
    ledger["zones"][zone_id]["trees_planted"] += quantity
    ledger["zones"][zone_id]["credits_earned"] += total_credits
    ledger["zones"][zone_id]["plantings"].append(transaction)
    ledger["total_credits"] += total_credits
    ledger["transactions"].append(transaction)
    
    # Update leaderboard
    ledger["leaderboard"] = sorted(
        [(z, ledger["zones"][z]["credits_earned"]) for z in ledger["zones"]],
        key=lambda x: x[1],
        reverse=True
    )
    
    save_carbon_ledger(ledger)
    
    return {
        "zone_id": zone_id,
        "species": species_name,
        "quantity": quantity,
        "credits_awarded": total_credits,
        "total_zone_credits": ledger["zones"][zone_id]["credits_earned"],
        "rank": next((i + 1 for i, (z, _) in enumerate(ledger["leaderboard"]) if z == zone_id), 0)
    }


def transfer_credits(from_zone: str, to_zone: str, credits: float) -> Dict[str, Any]:
    """Transfer carbon credits between zones."""
    ledger = load_carbon_ledger()
    
    if from_zone not in ledger["zones"] or ledger["zones"][from_zone]["credits_earned"] < credits:
        return {"error": "Insufficient credits"}
    
    if to_zone not in ledger["zones"]:
        ledger["zones"][to_zone] = {"trees_planted": 0, "credits_earned": 0, "plantings": []}
    
    ledger["zones"][from_zone]["credits_earned"] -= credits
    ledger["zones"][to_zone]["credits_earned"] += credits
    
    transaction = {
        "timestamp": datetime.now().isoformat(),
        "from_zone": from_zone,
        "to_zone": to_zone,
        "credits": credits,
        "type": "transfer"
    }
    ledger["transactions"].append(transaction)
    
    save_carbon_ledger(ledger)
    
    return {
        "from_zone": from_zone,
        "to_zone": to_zone,
        "credits_transferred": credits,
        "from_zone_remaining": ledger["zones"][from_zone]["credits_earned"],
        "to_zone_total": ledger["zones"][to_zone]["credits_earned"]
    }


def get_zone_stats(zone_id: str) -> Dict[str, Any]:
    """Get carbon economy stats for a zone."""
    ledger = load_carbon_ledger()
    
    if zone_id not in ledger["zones"]:
        return {
            "zone_id": zone_id,
            "trees_planted": 0,
            "carbon_credits": 0,
            "rank": "-"
        }
    
    zone_data = ledger["zones"][zone_id]
    rank = next((i + 1 for i, (z, _) in enumerate(ledger["leaderboard"]) if z == zone_id), 0)
    
    return {
        "zone_id": zone_id,
        "trees_planted": zone_data["trees_planted"],
        "carbon_credits": zone_data["credits_earned"],
        "rank": rank,
        "percentage_of_total": round((zone_data["credits_earned"] / ledger["total_credits"] * 100) if ledger["total_credits"] > 0 else 0, 2)
    }


def get_leaderboard(limit: int = 10) -> List[Dict[str, Any]]:
    """Get carbon leaderboard."""
    ledger = load_carbon_ledger()
    
    return [
        {
            "rank": i + 1,
            "zone_id": zone_id,
            "credits": credits,
            "trees_planted": ledger["zones"][zone_id]["trees_planted"]
        }
        for i, (zone_id, credits) in enumerate(ledger["leaderboard"][:limit])
    ]
