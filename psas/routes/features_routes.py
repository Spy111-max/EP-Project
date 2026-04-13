"""Routes for the active advanced feature set."""
from flask import Blueprint, request, jsonify
from psas.services.species_synergy_service import build_synergy_matrix, get_top_synergies, recommend_synergy_combos
from psas.services.timeline_service import project_zone_impact, compare_scenarios
from psas.services.pollutant_service import analyze_pollutant_profile, create_multipart_prescription
from psas.services.microclimate_service import get_microclimate_insights, divide_zone_into_microclimate_blocks
from psas.services.maintenance_service import predict_maintenance_needs, generate_maintenance_calendar, get_tree_health_status
from psas.services.impact_radius_service import create_impact_visualization_data
from psas.services.recommendation_service import get_zone_by_id
from psas.data_sources.tree_data import get_species_catalog
from psas.data_sources.aqi_data import get_hotspots

features_bp = Blueprint("features", __name__, url_prefix="/api/features")


@features_bp.route("/synergy/matrix", methods=["GET"])
def get_synergy_matrix():
    """Get species synergy scoring matrix."""
    species = get_species_catalog()
    matrix = build_synergy_matrix(species)
    return jsonify({"synergy_matrix": matrix})


@features_bp.route("/synergy/<species_name>", methods=["GET"])
def get_species_synergy(species_name):
    """Get top synergy partners for a species."""
    species = get_species_catalog()
    matrix = build_synergy_matrix(species)
    synergies = get_top_synergies(species_name, matrix, top_n=5)
    return jsonify({"species": species_name, "synergy_partners": synergies})


@features_bp.route("/synergy/zone/<zone_id>", methods=["GET"])
def get_zone_synergy_combos(zone_id):
    """Get recommended species combinations for a zone."""
    species = get_species_catalog()
    zones = get_hotspots()
    zone = get_zone_by_id(zones, zone_id)
    
    if not zone:
        return jsonify({"error": "Zone not found"}), 404
    
    combos = recommend_synergy_combos(species, zone, top_combos=5)
    return jsonify({"zone_id": zone_id, "recommended_combos": combos})


@features_bp.route("/timeline/<zone_id>", methods=["GET"])
def get_zone_timeline(zone_id):
    """Get 10-year PM2.5 reduction projection."""
    zones = get_hotspots()
    zone = get_zone_by_id(zones, zone_id)
    
    if not zone:
        return jsonify({"error": "Zone not found"}), 404
    
    species = get_species_catalog()
    recommendations = species[:5]  # Top 5 species
    quantities = {s["common_name"]: 50 for s in recommendations}
    
    impact = project_zone_impact(recommendations, quantities, years=10)
    return jsonify({"zone_id": zone_id, **impact})


@features_bp.route("/timeline/compare", methods=["POST"])
def compare_planting_scenarios():
    """Compare different planting scenarios."""
    data = request.json
    scenarios = data["scenarios"]  # Array of {name, recommendations, quantities}
    
    comparison = compare_scenarios(None, scenarios)
    return jsonify({"scenario_comparison": comparison})


@features_bp.route("/pollutant/<zone_id>", methods=["GET"])
def get_pollutant_prescription(zone_id):
    """Get pollutant-specific recommendations."""
    zones = get_hotspots()
    zone = get_zone_by_id(zones, zone_id)
    
    if not zone:
        return jsonify({"error": "Zone not found"}), 404
    
    species = get_species_catalog()
    prescription = create_multipart_prescription(species, zone)
    return jsonify(prescription)


@features_bp.route("/microclimate/<zone_id>", methods=["GET"])
def get_zone_microclimate(zone_id):
    """Analyze microclimate blocks within a zone."""
    zones = get_hotspots()
    zone = get_zone_by_id(zones, zone_id)
    
    if not zone:
        return jsonify({"error": "Zone not found"}), 404
    
    insights = get_microclimate_insights(zone, grid_size=3)
    return jsonify(insights)


@features_bp.route("/maintenance/calendar/<species_name>", methods=["POST"])
def get_maintenance_calendar(species_name):
    """Get maintenance calendar for a species."""
    data = request.json
    species = get_species_catalog()
    sp = next((s for s in species if s["common_name"] == species_name), None)
    
    if not sp:
        return jsonify({"error": "Species not found"}), 404
    
    calendar = generate_maintenance_calendar(sp, data["zone_id"], data["plant_date"])
    return jsonify({
        "species": species_name,
        "zone_id": data["zone_id"],
        "calendar": calendar
    })


@features_bp.route("/maintenance/predict/<species_name>/<zone_id>", methods=["GET"])
def predict_maintenance(species_name, zone_id):
    """Predict maintenance needs for a species in a zone."""
    species = get_species_catalog()
    sp = next((s for s in species if s["common_name"] == species_name), None)
    
    if not sp:
        return jsonify({"error": "Species not found"}), 404
    
    alerts = predict_maintenance_needs(sp, zone_id, age_months=12)
    return jsonify({
        "species": species_name,
        "zone_id": zone_id,
        "maintenance_alerts": alerts
    })


@features_bp.route("/impact/radius/<zone_id>", methods=["GET"])
def get_impact_visualization(zone_id):
    """Get impact radius visualization data."""
    zones = get_hotspots()
    zone = get_zone_by_id(zones, zone_id)
    
    if not zone:
        return jsonify({"error": "Zone not found"}), 404
    
    species = get_species_catalog()
    # Get top recommendations
    recommendations = [
        {"common_name": s["common_name"], "recommended_count": 50}
        for s in species[:10]
    ]
    
    visualization = create_impact_visualization_data(zone, species, recommendations)
    return jsonify(visualization)


@features_bp.route("/dashboard/all/<zone_id>", methods=["GET"])
def get_unified_dashboard(zone_id):
    """Get unified view of active features for a zone."""
    zones = get_hotspots()
    zone = get_zone_by_id(zones, zone_id)
    
    if not zone:
        return jsonify({"error": "Zone not found"}), 404
    
    species = get_species_catalog()
    
    return jsonify({
        "zone_id": zone_id,
        "synergy": recommend_synergy_combos(species, zone, top_combos=3),
        "microclimate": get_microclimate_insights(zone),
        "pollutant_profile": create_multipart_prescription(species, zone),
        "impact_projection": create_impact_visualization_data(zone, species, [{"common_name": s["common_name"], "recommended_count": 10} for s in species[:5]])
    })
