# Satellite-Based Urban Tree Planting Advisor

An interactive web application that uses satellite imagery and land analysis to identify suitable locations for planting trees (neem, banyan, mango, etc.) in major cities where land scarcity is a challenge.

---

## Problem

It is difficult to plant large trees such as **neem**, **banyan**, and **mango** in major cities due to:
- Lack of available open land
- Concrete/paved surfaces dominating urban areas
- Poor visibility into which patches of land are suitable

## Solution

This application uses **satellite data** (Sentinel-2 multispectral imagery via NDVI/EVI analysis, ESRI land cover classification, and OpenStreetMap overlays) to:

1. **Detect urban land structure** — identify parks, roadsides, unused plots, and green corridors.
2. **Score land suitability** — compute a confidence score (0–100%) per tile for tree planting potential.
3. **Support multiple tree species** — neem, banyan, mango, and others, each with different soil/space requirements.
4. **Cache satellite data** — avoid redundant API calls and keep the UI fast.
5. **Display live overlays** — colour-coded heatmap on top of the satellite base layer.

---

## Features

| Feature | Description |
|---|---|
| 🛰️ Satellite Base Layer | Sentinel-2 true-colour imagery via WMS |
| 🌿 NDVI Overlay | Normalized Difference Vegetation Index heatmap |
| 🏙️ Land Cover | ESRI 2023 global land cover (10 m resolution) |
| 🌳 Suitability Score | Per-pixel planting confidence (0–100%) |
| 🌱 Tree Species Filter | Filter results by neem / banyan / mango / custom |
| 💾 Response Cache | Server-side TTL cache (1 hour) to reduce API calls |
| 📍 City Search | Jump to any major city instantly |
| 📊 Statistics Panel | Area breakdown & top candidate zones |

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JS, [Leaflet.js](https://leafletjs.com/)
- **Backend**: Node.js + Express
- **Satellite Data**:
  - [Sentinel Hub WMS](https://www.sentinel-hub.com/) — Sentinel-2 imagery & NDVI
  - [ESRI Living Atlas](https://livingatlas.arcgis.com/landcover/) — 2023 Land Cover
  - [OpenStreetMap Overpass API](https://overpass-api.de/) — Urban greenspace polygons
- **Caching**: `node-cache` (server-side, 1-hour TTL)

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/Spy111-max/EP-Project.git
cd EP-Project
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

```env
SENTINEL_HUB_CLIENT_ID=your_client_id
SENTINEL_HUB_CLIENT_SECRET=your_client_secret
PORT=3000
```

> **Free tier available**: Sign up at [Sentinel Hub](https://www.sentinel-hub.com/) for a free 30-day trial with 30,000 processing units/month.

### 3. Run

```bash
npm start
```

Open **http://localhost:3000** in your browser.

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/land-analysis` | Analyse land suitability for a bounding box |
| GET | `/api/ndvi` | Fetch NDVI raster for a bounding box |
| GET | `/api/landcover` | Fetch ESRI land cover classification |
| GET | `/api/greenspaces` | Fetch OSM greenspace polygons |
| GET | `/api/cache/stats` | View cache hit/miss statistics |
| DELETE | `/api/cache/clear` | Clear the response cache |

### Example: Land Analysis

```
GET /api/land-analysis?lat=19.076&lng=72.877&radius=5000&tree=neem
```

Response:
```json
{
  "bbox": [72.832, 19.031, 72.922, 19.121],
  "tree": "neem",
  "confidence": 0.74,
  "suitableAreaHa": 142.3,
  "zones": [
    { "lat": 19.09, "lng": 72.85, "score": 0.91, "type": "roadside_green" },
    { "lat": 19.07, "lng": 72.88, "score": 0.83, "type": "vacant_plot" }
  ],
  "cached": false
}
```

---

## Directory Structure

```
EP-Project/
├── public/
│   ├── index.html          # Main UI
│   ├── css/
│   │   └── styles.css      # Application styles
│   └── js/
│       ├── app.js          # Main application logic
│       ├── map.js          # Leaflet map initialisation & layers
│       ├── satellite.js    # Satellite WMS layer helpers
│       ├── landAnalysis.js # Suitability scoring engine
│       └── ui.js           # UI controls & stats panel
├── src/
│   ├── routes/
│   │   ├── landAnalysis.js # /api/land-analysis route
│   │   ├── ndvi.js         # /api/ndvi route
│   │   ├── landcover.js    # /api/landcover route
│   │   └── greenspaces.js  # /api/greenspaces route
│   ├── services/
│   │   ├── sentinelHub.js  # Sentinel Hub API client
│   │   ├── esriLandcover.js# ESRI land cover client
│   │   └── osmGreenspace.js# OSM Overpass client
│   └── cache.js            # Shared node-cache instance
├── server.js               # Express server entry point
├── .env.example            # Environment variable template
├── package.json
└── README.md
```

---

## License

MIT