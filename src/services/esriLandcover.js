"use strict";

/**
 * ESRI 2023 Land Cover service
 * ──────────────────────────────
 * Queries the ArcGIS Living Atlas 10 m global land cover layer via
 * the Image Service REST API to count land-cover pixels inside a bbox.
 *
 * Layer URL: https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer
 *
 * Class codes (2023 schema):
 *   1  Water         5  Crops         7  Built Area
 *   2  Trees         6  Built Area    8  Bare Ground
 *   3  Grass/Shrub   7  Snow/Ice      9  Clouds
 *   4  Flooded Veg   (legacy variant differs slightly)
 *
 * Docs: https://www.arcgis.com/home/item.html?id=cfcb7609de5f478eb7666240902d4d3d
 */

const fetch = require("node-fetch");
const cache = require("../cache");

const SERVICE_URL =
  "https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer";

// Land cover class labels
const CLASS_LABELS = {
  1: "water",
  2: "trees",
  3: "grass_shrub",
  4: "flooded_vegetation",
  5: "crops",
  6: "scrub_shrub",
  7: "built_area",
  8: "bare_ground",
  9: "snow_ice",
  10: "clouds",
  11: "rangeland",
};

/**
 * Returns a pixel-count breakdown by land cover class for the given bbox.
 * bbox: [minLng, minLat, maxLng, maxLat]
 */
async function getLandCoverStats(bbox) {
  const cacheKey = `lc:${bbox.join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) return { stats: cached, cached: true };

  const [minLng, minLat, maxLng, maxLat] = bbox;

  // Compute statistics via histograms
  const params = new URLSearchParams({
    geometryType: "esriGeometryEnvelope",
    geometry: JSON.stringify({ xmin: minLng, ymin: minLat, xmax: maxLng, ymax: maxLat, spatialReference: { wkid: 4326 } }),
    f: "json",
  });

  const res = await fetch(`${SERVICE_URL}/computeStatistics?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`ESRI land cover API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // Parse histogram bands → class distribution
  const stats = {};
  const histograms = (data.histograms || []).flatMap((h) => h.counts || []);
  histograms.forEach((count, idx) => {
    const classId = idx + 1;
    const label = CLASS_LABELS[classId] || `class_${classId}`;
    stats[label] = (stats[label] || 0) + count;
  });

  cache.set(cacheKey, stats);
  return { stats, cached: false };
}

/**
 * Returns the WMS URL for the ESRI land cover layer (Leaflet-compatible).
 */
function getLandCoverWmsUrl() {
  return `${SERVICE_URL}/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=0&FORMAT=image%2Fpng&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&BBOX={bbox-epsg-3857}`;
}

module.exports = { getLandCoverStats, getLandCoverWmsUrl, CLASS_LABELS };
