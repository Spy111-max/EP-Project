# Pollution-Driven Smart Afforestation System (PSAS)

A minimal, data-driven web platform that identifies pollution hotspots and recommends tree species for short-term and long-term ecological recovery.

## What This Prototype Includes

- Flask backend with REST APIs for:
  - hotspot detection and zone prioritization
  - species recommendation engine
  - AQI and carbon impact forecasting (5, 10, 20 years)
- Minimal frontend using:
  - HTML/CSS/JavaScript
  - Leaflet.js map for hotspot visualization
  - Chart.js for impact projections
- Curated mock datasets for:
  - AQI-style pollutant metrics (PM2.5, PM10, NOx, SOx, CO2)
  - local environmental attributes (soil, rainfall, temperature)
  - species metadata (growth profile, absorption, carbon sequestration)

## Stack Used

- Backend: Flask + Python
- Data Processing: Python scoring and forecast logic
- Frontend: HTML5, CSS3, JavaScript, Leaflet.js, Chart.js
- Storage (current): JSON files (easy to swap for PostgreSQL/PostGIS later)

## Project Structure

```
EP-Project/
├── app.py
├── requirements.txt
├── data/
│   ├── hotspots.json
│   ├── species.json
│   └── environment/
│       ├── soil_profiles_india.json
│       ├── climate_normals_india.json
│       └── pollution_factor_weights.json
├── psas/
│   ├── constants.py
│   ├── types.py
│   ├── data_sources/
│   │   ├── aqi_data.py
│   │   ├── environment_data.py
│   │   ├── tree_data.py
│   │   └── json_store.py
│   ├── ml/
│   │   └── recommender_model.py
│   ├── routes/
│   │   ├── web_routes.py
│   │   ├── aqi_routes.py
│   │   ├── recommendation_routes.py
│   │   ├── impact_routes.py
│   │   └── ml_routes.py
│   └── services/
│       ├── pollution_service.py
│       ├── recommendation_service.py
│       └── impact_service.py
├── static/
│   ├── app.js
│   └── styles.css
└── templates/
	 └── index.html
```

## Sector-Wise Code Split

- AQI/Hotspots sector:
	- data loader and optional OpenAQ adapter in `psas/data_sources/aqi_data.py`
	- zone enrichment and pollution classification in `psas/services/pollution_service.py`
- Tree species sector:
	- species dataset loader in `psas/data_sources/tree_data.py`
	- species scoring and recommendation engine in `psas/services/recommendation_service.py`
- Impact forecasting sector:
	- PM2.5 and carbon forecasting logic in `psas/services/impact_service.py`
- API layer:
	- blueprint routes in `psas/routes/` (sector-specific)
	- `app.py` only bootstraps Flask and registers blueprints

This structure makes it easier to work independently on each sector without touching unrelated parts.

## Quick Start

1. Create and activate a virtual environment.
2. Install dependencies.
3. Run the Flask server.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open: `http://127.0.0.1:5000`

## API Endpoints

### `GET /api/health`
Basic health check.

### `GET /api/hotspots?city=<query>&source=<mock|openaq>`
Returns pollution hotspots, urgency score, and pollution band.

- `source=mock` (default): local curated dataset
- `source=openaq`: attempts live OpenAQ locations API and falls back to mock data if unavailable

Optional environment variables for OpenAQ mode:

- `OPENAQ_API_KEY`
- `OPENAQ_ENDPOINT` (defaults to `https://api.openaq.org/v3/locations`)

### `GET /api/recommendations?zone_id=<zone-id>`
Returns top matching tree species in two groups:

- fast-growing species
- long-term species

Recommendation payload now includes:

- `rule_score` (domain-driven score)
- `ml_score` (trained AI model score when model is available)
- `match_score` (blended ranking score)
- `land_structure` (satellite-fusion land mix, feasibility class, and measures)
- `land_filter` (space-tier eligibility and fallback metadata)

The land-structure block now comes from live satellite raster sampling using ESA WorldCover 2021/2020 tiles, with the active map overlay proxied through the Flask backend for same-origin rendering.

### `GET /api/impact?zone_id=<zone-id>`
Returns impact forecast with:

- projected PM2.5 (5/10/20 years)
- AQI band progression
- estimated carbon sequestration (tonnes)

### `GET /api/model/status`
Returns model availability and latest training metrics.

### `POST /api/model/train`
Trains the AI recommendation model using hotspot, species, and environmental factor datasets.
Returns model metrics such as `r2` and `mae`.

## Recommendation Logic (Current)

Species are scored using:

- pollutant absorption suitability
- climate fit (temperature and rainfall window)
- soil compatibility
- zone-type bias (industrial/traffic gets stronger fast-track weight)

When a trained model is available, the final rank uses blended scoring:

- 62% rule-based domain score
- 38% ML model score

Land-structure aware filtering now runs before final ranking:

- samples real raster pixels from satellite-derived WMS layers
- blends 2021 and 2020 WorldCover vintages for stability
- derives built-up/agriculture/green-open/water mix and feasibility score
- applies space-tier constraints (compact/medium/large) to avoid infeasible choices in dense zones
- returns implementation measures specific to dense urban, mixed, or peri-urban/open contexts

This keeps recommendations stable while improving adaptation to multi-factor patterns.

## Train The AI Model

```bash
pip install -r requirements.txt
curl -X POST http://127.0.0.1:5000/api/model/train
curl http://127.0.0.1:5000/api/model/status
```

## Required Real-World Datasets (Production Path)

Integrate the following to move this prototype into production:

1. Air Quality Data
	- OpenAQ API
	- CPCB India data feeds
2. Satellite Data
	- NASA Earth Observation
	- Sentinel-2 / Landsat
3. Environmental Data
	- FAO/ICAR soil datasets
	- IMD/NOAA rainfall and temperature records
4. Tree Species Data
	- native species per ecological region
	- growth rate, pollutant absorption, survival constraints
	- carbon sequestration benchmarks

## Suggested Next Upgrades

- replace JSON with PostgreSQL + PostGIS (zone polygons, raster indexes)
- add GeoPandas/Rasterio pipeline for satellite overlays
- train ML models for AQI reduction forecasts using historical data
- add user-authenticated planning workflows for municipal bodies