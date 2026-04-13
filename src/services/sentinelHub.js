"use strict";

/**
 * Sentinel Hub service
 * ─────────────────────
 * Fetches OAuth2 tokens and provides helpers for:
 *   • True-colour WMS tiles (Sentinel-2 L2A)
 *   • NDVI evalscript via Process API
 *
 * Docs: https://docs.sentinel-hub.com/api/latest/
 */

const fetch = require("node-fetch");
const cache = require("../cache");

const BASE_URL = "https://services.sentinel-hub.com";

// ── Token management ──────────────────────────────────────────────────────────

let _tokenExpiry = 0;
let _accessToken = null;

async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiry) {
    return _accessToken;
  }

  const clientId = process.env.SENTINEL_HUB_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Sentinel Hub credentials not configured. Set SENTINEL_HUB_CLIENT_ID and SENTINEL_HUB_CLIENT_SECRET in .env"
    );
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${BASE_URL}/auth/realms/main/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`Sentinel Hub auth failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh 60 s early
  return _accessToken;
}

// ── NDVI via Process API ──────────────────────────────────────────────────────

/**
 * Returns a 256×256 PNG with NDVI values colour-mapped green→yellow→red.
 * bbox: [minLng, minLat, maxLng, maxLat]
 */
async function getNdviImage(bbox, date = null) {
  const cacheKey = `ndvi:${bbox.join(",")}:${date || "latest"}`;
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, cached: true };

  const token = await getAccessToken();

  // Sentinel-2 NDVI evalscript
  const evalscript = `//VERSION=3
function setup() {
  return { input: [{ bands: ["B04", "B08"] }], output: { bands: 3 } };
}
function evaluatePixel(s) {
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  if (ndvi < 0)    return [0.5, 0.5, 0.5];
  if (ndvi < 0.2)  return [0.8, 0.2, 0.0];
  if (ndvi < 0.4)  return [0.9, 0.7, 0.0];
  if (ndvi < 0.6)  return [0.4, 0.8, 0.2];
  return [0.0, 0.6, 0.0];
}`;

  const body = {
    input: {
      bounds: { bbox, properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" } },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: date ? { timeRange: { from: `${date}T00:00:00Z`, to: `${date}T23:59:59Z` } } : undefined,
        },
      ],
    },
    output: { width: 256, height: 256, responses: [{ identifier: "default", format: { type: "image/png" } }] },
    evalscript,
  };

  const res = await fetch(`${BASE_URL}/api/v1/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Sentinel Hub Process API error: ${res.status} ${res.statusText}`);
  }

  const buffer = await res.buffer();
  const base64 = buffer.toString("base64");
  cache.set(cacheKey, base64);
  return { data: base64, cached: false };
}

// ── WMS tile URL builder (for Leaflet) ───────────────────────────────────────

/**
 * Returns a Leaflet-compatible WMS URL template for Sentinel-2 true-colour.
 * Requires a Sentinel Hub WMS instance ID (configured in the dashboard).
 * Falls back gracefully to an empty string when no instance ID is set.
 */
function getSentinelWmsUrl() {
  const instanceId = process.env.SENTINEL_HUB_INSTANCE_ID || "";
  if (!instanceId) return null;
  return `${BASE_URL}/ogc/wms/${instanceId}?SERVICE=WMS&REQUEST=GetMap&LAYERS=TRUE-COLOR&STYLES=&FORMAT=image%2Fjpeg&VERSION=1.1.1&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&BBOX={bbox-epsg-3857}`;
}

module.exports = { getAccessToken, getNdviImage, getSentinelWmsUrl };
