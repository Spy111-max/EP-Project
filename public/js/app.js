/**
 * app.js
 * ───────
 * Entry point: wires together MapManager, LandAnalysis, Satellite, and UI.
 * Handles user interactions (city search, analyse button, layer toggles).
 */

"use strict";

(async function main() {
  // ── Initialise map ─────────────────────────────────────────────────────────
  MapManager.init();

  // ── State ──────────────────────────────────────────────────────────────────
  let currentLat = null;
  let currentLng = null;
  let currentBbox = null;

  // ── City quick-select suggestions ──────────────────────────────────────────
  const MAJOR_CITIES = [
    { name: "Mumbai",    lat: 19.0760, lng: 72.8777 },
    { name: "Delhi",     lat: 28.6139, lng: 77.2090 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Chennai",   lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata",   lat: 22.5726, lng: 88.3639 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Pune",      lat: 18.5204, lng: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Jaipur",    lat: 26.9124, lng: 75.7873 },
    { name: "Surat",     lat: 21.1702, lng: 72.8311 },
    { name: "Lucknow",   lat: 26.8467, lng: 80.9462 },
    { name: "Kanpur",    lat: 26.4499, lng: 80.3319 },
    { name: "Nagpur",    lat: 21.1458, lng: 79.0882 },
    { name: "Patna",     lat: 25.5941, lng: 85.1376 },
    { name: "Indore",    lat: 22.7196, lng: 75.8577 },
  ];

  // Populate datalist
  const datalist = document.getElementById("city-suggestions");
  MAJOR_CITIES.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.name;
    datalist.appendChild(opt);
  });

  // ── Geocode helper ─────────────────────────────────────────────────────────

  /**
   * Resolves a city name to lat/lng.
   * First checks the static list, then falls back to Nominatim.
   */
  async function geocode(query) {
    const q = query.trim().toLowerCase();
    const city = MAJOR_CITIES.find((c) => c.name.toLowerCase() === q);
    if (city) return { lat: city.lat, lng: city.lng };

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) throw new Error("Geocoding service unavailable.");
    const data = await res.json();
    if (!data.length) throw new Error(`Location not found: "${query}"`);
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }

  // ── Run analysis ───────────────────────────────────────────────────────────

  async function runAnalysis() {
    const cityInput = document.getElementById("city-input").value.trim();
    const radiusM   = parseInt(document.getElementById("radius-input").value, 10);
    const tree      = document.getElementById("tree-select").value;

    if (!cityInput) {
      UI.toast("Please enter a city or location.", "error");
      return;
    }

    UI.showSpinner(true);
    document.getElementById("analyse-btn").disabled = true;

    try {
      // 1. Geocode
      const { lat, lng } = await geocode(cityInput);
      currentLat  = lat;
      currentLng  = lng;

      MapManager.flyTo(lat, lng, 13);
      MapManager.setRadiusCircle(lat, lng, radiusM);

      // 2. Compute bbox for NDVI
      const delta = radiusM / 111320;
      currentBbox = [lng - delta, lat - delta, lng + delta, lat + delta];

      // 3. Fetch land analysis + NDVI + greenspaces in parallel
      const [analysisResult, ndviBase64, greenspaceGeoJSON] = await Promise.all([
        LandAnalysis.analyse(lat, lng, radiusM, tree),
        LandAnalysis.fetchNdvi(currentBbox),
        LandAnalysis.fetchGreenspaces(lat, lng, radiusM),
      ]);

      // 4. Update map layers
      MapManager.setNdviLayer(currentBbox, ndviBase64,
        parseFloat(document.getElementById("overlay-opacity").value));
      MapManager.setGreenspaceLayer(greenspaceGeoJSON);
      MapManager.setHeatmapLayer(analysisResult.zones);

      // 5. Update sidebar
      UI.renderStats(analysisResult);
      UI.renderZones(analysisResult.zones, (zone) => {
        MapManager.flyTo(zone.lat, zone.lng, 15);
      });

      const pct = Math.round(analysisResult.confidence * 100);
      UI.toast(
        `Analysis complete — ${pct}% suitability, ${analysisResult.totalZones} zones found.`,
        pct >= 60 ? "info" : "warn",
        4000
      );
    } catch (err) {
      UI.toast(err.message, "error", 5000);
      console.error(err);
    } finally {
      UI.showSpinner(false);
      document.getElementById("analyse-btn").disabled = false;
    }
  }

  // ── Event listeners ────────────────────────────────────────────────────────

  document.getElementById("analyse-btn").addEventListener("click", runAnalysis);

  document.getElementById("city-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") runAnalysis();
  });

  document.getElementById("radius-input").addEventListener("input", (e) => {
    UI.updateRadiusLabel(e.target.value);
    if (currentLat !== null) {
      MapManager.setRadiusCircle(currentLat, currentLng, parseInt(e.target.value, 10));
    }
  });

  // Layer toggles
  document.getElementById("toggle-satellite").addEventListener("change", (e) =>
    MapManager.toggleSatellite(e.target.checked));
  document.getElementById("toggle-ndvi").addEventListener("change", (e) =>
    MapManager.toggleNdvi(e.target.checked));
  document.getElementById("toggle-landcover").addEventListener("change", (e) =>
    MapManager.toggleLandcover(e.target.checked));
  document.getElementById("toggle-greenspaces").addEventListener("change", (e) =>
    MapManager.toggleGreenspaces(e.target.checked));
  document.getElementById("toggle-heatmap").addEventListener("change", (e) =>
    MapManager.toggleHeatmap(e.target.checked));

  // Opacity slider
  document.getElementById("overlay-opacity").addEventListener("input", (e) =>
    MapManager.setOverlayOpacity(e.target.value));

  // Initialise radius label
  UI.updateRadiusLabel(document.getElementById("radius-input").value);
})();
