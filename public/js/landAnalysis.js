/**
 * landAnalysis.js
 * ────────────────
 * Client-side wrapper around the /api/land-analysis endpoint.
 * Also provides helper functions for rendering results on the map.
 */

"use strict";

const LandAnalysis = (() => {
  // Simple in-memory cache keyed on request parameters
  const _cache = new Map();

  /**
   * Fetches land analysis data for a given location and species.
   * Results are cached in-memory for the browser session.
   *
   * @param {number} lat
   * @param {number} lng
   * @param {number} radiusM  - metres
   * @param {string} tree     - "neem" | "banyan" | "mango" | "any"
   * @returns {Promise<object>}
   */
  async function analyse(lat, lng, radiusM, tree) {
    const key = `${lat},${lng},${radiusM},${tree}`;
    if (_cache.has(key)) return _cache.get(key);

    const url = `/api/land-analysis?lat=${lat}&lng=${lng}&radius=${radiusM}&tree=${encodeURIComponent(tree)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    _cache.set(key, data);
    return data;
  }

  /**
   * Fetches NDVI image for a bounding box.
   * Returns null when the server has no Sentinel Hub key (HTTP 204).
   *
   * @param {number[]} bbox - [minLng, minLat, maxLng, maxLat]
   * @returns {Promise<string|null>} base64 PNG or null
   */
  async function fetchNdvi(bbox) {
    const res = await fetch(`/api/ndvi?bbox=${bbox.join(",")}`);
    if (res.status === 204) return null;
    if (!res.ok) return null;
    const data = await res.json();
    return data.image || null;
  }

  /**
   * Fetches OSM greenspace GeoJSON for a location.
   *
   * @param {number} lat
   * @param {number} lng
   * @param {number} radiusM
   * @returns {Promise<object>} GeoJSON FeatureCollection
   */
  async function fetchGreenspaces(lat, lng, radiusM) {
    const res = await fetch(`/api/greenspaces?lat=${lat}&lng=${lng}&radius=${radiusM}`);
    if (!res.ok) return { type: "FeatureCollection", features: [] };
    const data = await res.json();
    return data.geojson || { type: "FeatureCollection", features: [] };
  }

  /**
   * Chooses a colour for a suitability score (0–1).
   * red → yellow → green
   */
  function scoreColour(score) {
    if (score >= 0.75) return "#43a047";
    if (score >= 0.50) return "#ffb300";
    return "#e53935";
  }

  /**
   * Returns a CSS class name for score badges.
   */
  function scoreBadgeClass(score) {
    if (score >= 0.75) return "high";
    if (score >= 0.50) return "medium";
    return "low";
  }

  return { analyse, fetchNdvi, fetchGreenspaces, scoreColour, scoreBadgeClass };
})();

// eslint-disable-next-line no-unused-vars
window.LandAnalysis = LandAnalysis;
