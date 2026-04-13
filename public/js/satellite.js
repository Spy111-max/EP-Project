/**
 * satellite.js
 * ─────────────
 * Helpers for constructing Leaflet WMS tile layers backed by:
 *   • Sentinel Hub (Sentinel-2 true-colour, when configured)
 *   • ESRI Land Cover WMS
 *   • OpenStreetMap (free fallback satellite-style basemap)
 */

"use strict";

const Satellite = (() => {
  /**
   * Returns a Leaflet tile layer for the satellite basemap.
   * Uses Esri World Imagery (free, no key required) as the base.
   * Sentinel Hub true-colour is overlaid when the server provides a WMS URL.
   */
  function buildBaselayer() {
    return L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 19,
        opacity: 1,
      }
    );
  }

  /**
   * Returns a Leaflet tile layer for the ESRI 2023 land cover WMS.
   */
  function buildLandCoverLayer(opacity = 0.6) {
    return L.tileLayer.wms(
      "https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/WMSServer",
      {
        layers: "0",
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        attribution: "ESRI 2023 Land Cover",
        opacity,
      }
    );
  }

  /**
   * Constructs a canvas-based NDVI overlay layer from a base64-encoded PNG
   * image returned by the /api/ndvi endpoint.
   * Falls back to nothing if the server returned 204 (no key configured).
   */
  function buildNdviImageLayer(bbox, base64Png, opacity = 0.7) {
    if (!base64Png) return null;

    // bbox = [minLng, minLat, maxLng, maxLat]
    const bounds = L.latLngBounds(
      [bbox[1], bbox[0]], // SW
      [bbox[3], bbox[2]]  // NE
    );

    return L.imageOverlay(`data:image/png;base64,${base64Png}`, bounds, { opacity });
  }

  return { buildBaselayer, buildLandCoverLayer, buildNdviImageLayer };
})();

// eslint-disable-next-line no-unused-vars
window.Satellite = Satellite;
