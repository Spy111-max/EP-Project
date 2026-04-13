/**
 * map.js
 * ───────
 * Initialises the Leaflet map and manages all map layers:
 *   • Satellite basemap (Esri World Imagery)
 *   • NDVI overlay
 *   • ESRI land cover WMS
 *   • OSM greenspace polygons
 *   • Zone suitability heatmap (circle markers)
 *   • Radius indicator circle
 */

"use strict";

const MapManager = (() => {
  let _map = null;
  let _baselayer = null;
  let _ndviLayer = null;
  let _landcoverLayer = null;
  let _greenspaceLayer = null;
  let _heatmapLayer = null;
  let _radiusCircle = null;

  // Default view: India (covers most major Indian cities)
  const DEFAULT_CENTER = [20.5937, 78.9629];
  const DEFAULT_ZOOM   = 5;

  function init() {
    _map = L.map("map", {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    // Satellite basemap (always visible)
    _baselayer = Satellite.buildBaselayer().addTo(_map);

    // Land cover WMS (off by default; toggled via UI)
    _landcoverLayer = Satellite.buildLandCoverLayer(0.6);

    // Layer groups for greenspaces and heatmap
    _greenspaceLayer = L.layerGroup().addTo(_map);
    _heatmapLayer    = L.layerGroup().addTo(_map);

    return _map;
  }

  /** Pan & zoom the map to a lat/lng with optional animation. */
  function flyTo(lat, lng, zoom = 13) {
    _map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }

  /** Show/hide a radius circle around the search centre. */
  function setRadiusCircle(lat, lng, radiusM) {
    if (_radiusCircle) _map.removeLayer(_radiusCircle);
    _radiusCircle = L.circle([lat, lng], {
      radius: radiusM,
      color: "#66bb6a",
      weight: 2,
      dashArray: "6 4",
      fill: false,
    }).addTo(_map);
  }

  /** Replace the NDVI image overlay. Pass null to remove. */
  function setNdviLayer(bbox, base64Png, opacity = 0.7) {
    if (_ndviLayer) _map.removeLayer(_ndviLayer);
    _ndviLayer = base64Png ? Satellite.buildNdviImageLayer(bbox, base64Png, opacity) : null;
    if (_ndviLayer) _ndviLayer.addTo(_map);
  }

  /** Render OSM greenspace polygons. */
  function setGreenspaceLayer(geojson) {
    _greenspaceLayer.clearLayers();
    if (!geojson || !geojson.features.length) return;

    L.geoJSON(geojson, {
      style: {
        color: "#43a047",
        weight: 1.5,
        fillColor: "#81c784",
        fillOpacity: 0.25,
      },
      onEachFeature(feature, layer) {
        const tags = feature.properties.tags || {};
        const name = tags.name || tags.leisure || tags.landuse || tags.natural || "Green area";
        layer.bindPopup(`<b>${name}</b>`);
      },
    }).addTo(_greenspaceLayer);
  }

  /** Render zone suitability circle markers as a heatmap. */
  function setHeatmapLayer(zones) {
    _heatmapLayer.clearLayers();
    if (!zones || !zones.length) return;

    zones.forEach((zone) => {
      const colour = LandAnalysis.scoreColour(zone.score);
      const badgeClass = LandAnalysis.scoreBadgeClass(zone.score);
      const pct = Math.round(zone.score * 100);

      const circle = L.circleMarker([zone.lat, zone.lng], {
        radius: 12 + zone.score * 10,
        color: colour,
        weight: 2,
        fillColor: colour,
        fillOpacity: 0.45,
      });

      circle.bindPopup(`
        <div class="zone-popup">
          <h3>${zone.type.replace(/_/g, " ")}</h3>
          <span class="score-badge ${badgeClass}">${pct}% suitable</span>
          <div style="margin-top:6px;font-size:0.8rem;color:#555">
            Area: ~${(zone.areaM2 / 10000).toFixed(2)} ha<br>
            Trees capacity: ${zone.treesPerZone}
          </div>
        </div>
      `);

      circle.addTo(_heatmapLayer);
    });
  }

  // ── Layer visibility toggles ────────────────────────────────────────────────

  function toggleSatellite(visible) {
    if (visible) { if (!_map.hasLayer(_baselayer)) _baselayer.addTo(_map); }
    else         { if (_map.hasLayer(_baselayer))  _map.removeLayer(_baselayer); }
  }

  function toggleNdvi(visible) {
    if (!_ndviLayer) return;
    if (visible) { if (!_map.hasLayer(_ndviLayer)) _ndviLayer.addTo(_map); }
    else         { if (_map.hasLayer(_ndviLayer))  _map.removeLayer(_ndviLayer); }
  }

  function toggleLandcover(visible) {
    if (visible) { if (!_map.hasLayer(_landcoverLayer)) _landcoverLayer.addTo(_map); }
    else         { if (_map.hasLayer(_landcoverLayer))  _map.removeLayer(_landcoverLayer); }
  }

  function toggleGreenspaces(visible) {
    if (visible) { if (!_map.hasLayer(_greenspaceLayer)) _greenspaceLayer.addTo(_map); }
    else         { if (_map.hasLayer(_greenspaceLayer))  _map.removeLayer(_greenspaceLayer); }
  }

  function toggleHeatmap(visible) {
    if (visible) { if (!_map.hasLayer(_heatmapLayer)) _heatmapLayer.addTo(_map); }
    else         { if (_map.hasLayer(_heatmapLayer))  _map.removeLayer(_heatmapLayer); }
  }

  function setOverlayOpacity(value) {
    const opacity = parseFloat(value);
    if (_ndviLayer)      _ndviLayer.setOpacity(opacity);
    if (_landcoverLayer) _landcoverLayer.setOpacity(opacity);
    _heatmapLayer.eachLayer((l) => {
      if (l.setStyle) l.setStyle({ fillOpacity: opacity * 0.65, opacity: Math.min(1, opacity + 0.3) });
    });
    _greenspaceLayer.eachLayer((l) => {
      if (l.setStyle) l.setStyle({ fillOpacity: opacity * 0.35 });
    });
  }

  function getMap() { return _map; }

  return {
    init, flyTo, setRadiusCircle,
    setNdviLayer, setGreenspaceLayer, setHeatmapLayer,
    toggleSatellite, toggleNdvi, toggleLandcover, toggleGreenspaces, toggleHeatmap,
    setOverlayOpacity, getMap,
  };
})();

// eslint-disable-next-line no-unused-vars
window.MapManager = MapManager;
