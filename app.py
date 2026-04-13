from __future__ import annotations

from flask import Flask
from psas.routes.aqi_routes import aqi_bp
from psas.routes.impact_routes import impact_bp
from psas.routes.ml_routes import ml_bp
from psas.routes.recommendation_routes import recommendation_bp
from psas.routes.land_routes import land_bp
from psas.routes.web_routes import web_bp
from psas.routes.features_routes import features_bp

app = Flask(__name__, template_folder="templates", static_folder="static")
app.register_blueprint(web_bp)
app.register_blueprint(aqi_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(land_bp)
app.register_blueprint(impact_bp)
app.register_blueprint(ml_bp)
app.register_blueprint(features_bp)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
