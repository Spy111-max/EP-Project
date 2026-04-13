"use strict";

/**
 * OpenStreetMap Overpass API service
 * ────────────────────────────────────
 * Fetches greenspace polygons (parks, gardens, forests, grass areas)
 * within a radius around a lat/lng using the Overpass QL API.
 *
 * Docs: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

const fetch = require("node-fetch");
const cache = require("../cache");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// OSM tags that represent potential planting zones
const GREENSPACE_TAGS = [
  '["leisure"="park"]',
  '["leisure"="garden"]',
  '["landuse"="grass"]',
  '["landuse"="meadow"]',
  '["landuse"="forest"]',
  '["natural"="wood"]',
  '["natural"="grassland"]',
  '["amenity"="grave_yard"]',
  '["landuse"="cemetery"]',
  '["landuse"="allotments"]',
];

/**
 * Fetches greenspace features around a point within a given radius (metres).
 * Returns a GeoJSON FeatureCollection.
 */
async function getGreenspaces(lat, lng, radiusM = 5000) {
  const cacheKey = `osm:${lat},${lng},${radiusM}`;
  const cached = cache.get(cacheKey);
  if (cached) return { geojson: cached, cached: true };

  // Build union query for all greenspace tag variants
  const unionParts = GREENSPACE_TAGS.flatMap((tag) => [
    `way${tag}(around:${radiusM},${lat},${lng});`,
    `relation${tag}(around:${radiusM},${lat},${lng});`,
  ]).join("\n      ");

  const query = `
    [out:json][timeout:25];
    (
      ${unionParts}
    );
    out body;
    >;
    out skel qt;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const geojson = overpassToGeoJSON(data);

  cache.set(cacheKey, geojson);
  return { geojson, cached: false };
}

/**
 * Minimal Overpass JSON → GeoJSON converter (way nodes → polygon).
 */
function overpassToGeoJSON(overpassData) {
  const nodes = {};
  const features = [];

  for (const el of overpassData.elements || []) {
    if (el.type === "node") {
      nodes[el.id] = [el.lon, el.lat];
    }
  }

  for (const el of overpassData.elements || []) {
    if (el.type === "way" && el.nodes && el.nodes.length > 2) {
      const coords = el.nodes.map((id) => nodes[id]).filter(Boolean);
      if (coords.length < 3) continue;

      // Close polygon if needed
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);

      features.push({
        type: "Feature",
        properties: { id: el.id, tags: el.tags || {} },
        geometry: { type: "Polygon", coordinates: [coords] },
      });
    }
  }

  return { type: "FeatureCollection", features };
}

module.exports = { getGreenspaces };
