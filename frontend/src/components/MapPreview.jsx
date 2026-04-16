import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Rectangle } from "react-leaflet";
import { cardHover } from "../animations/variants";
import { Layers3 } from "lucide-react";

export default function MapPreview({ cities, selectedCity, hotspots, onSelectCity }) {
  const [baseLayer, setBaseLayer] = useState("grayscale");
  const [viewMode, setViewMode] = useState("standard");

  const indiaBounds = [
    [6.0, 68.0],
    [38.5, 97.5],
  ];

  const fallbackCenter = [22.9734, 78.6569];
  const mapCenter = isValidLatLng(selectedCity?.position) ? selectedCity.position : fallbackCenter;
  const mapZoom = selectedCity ? 7 : 5;
  const minZoom = 4;
  const maxZoom = 12;

  function isValidLatLng(value) {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      Number.isFinite(value[0]) &&
      Number.isFinite(value[1]) &&
      value[0] >= -90 &&
      value[0] <= 90 &&
      value[1] >= -180 &&
      value[1] <= 180
    );
  }

  const safeCities = (cities || [])
    .filter((city) => isValidLatLng(city.position))
    .map((city) => ({ ...city, safePosition: [Number(city.position[0]), Number(city.position[1])] }));

  const safeHotspots = (hotspots || [])
    .filter((spot) => isValidLatLng(spot.position))
    .map((spot) => ({
      ...spot,
      safePosition: [Number(spot.position[0]), Number(spot.position[1])],
      safeAqi: Number.isFinite(spot.aqi) ? spot.aqi : 100,
    }));

  function getPollutionGrey(aqi) {
    if (aqi <= 50) return "#f5f5f5";
    if (aqi <= 80) return "#e5e7eb";
    if (aqi <= 110) return "#d1d5db";
    if (aqi <= 140) return "#9ca3af";
    if (aqi <= 170) return "#6b7280";
    if (aqi <= 210) return "#4b5563";
    return "#1f2937";
  }

  function estimateCellAqi(lat, lon) {
    if (!safeHotspots.length) return 0;

    let weightedAqi = 0;
    let totalWeight = 0;

    safeHotspots.forEach((spot) => {
      const dLat = lat - spot.safePosition[0];
      const dLon = lon - spot.safePosition[1];
      const distance = Math.sqrt(dLat * dLat + dLon * dLon);
      const weight = 1 / (distance * distance + 0.14);
      weightedAqi += spot.safeAqi * weight;
      totalWeight += weight;
    });

    return totalWeight ? weightedAqi / totalWeight : 0;
  }

  const densityCells = useMemo(() => {
    const latStep = 1.35;
    const lonStep = 1.35;
    const cells = [];

    for (let lat = 6.0; lat < 38.5; lat += latStep) {
      for (let lon = 68.0; lon < 97.5; lon += lonStep) {
        const centerLat = lat + latStep / 2;
        const centerLon = lon + lonStep / 2;
        const estimatedAqi = estimateCellAqi(centerLat, centerLon);
        if (estimatedAqi < 55) continue;

        const fillOpacity = Math.min(0.78, Math.max(0.12, (estimatedAqi - 45) / 215));

        cells.push({
          id: `density-${lat.toFixed(2)}-${lon.toFixed(2)}`,
          bounds: [
            [lat, lon],
            [Math.min(lat + latStep, 38.5), Math.min(lon + lonStep, 97.5)],
          ],
          fillColor: getPollutionGrey(estimatedAqi),
          fillOpacity,
        });
      }
    }

    return cells;
  }, [safeHotspots]);

  const getTileLayer = () => {
    switch (baseLayer) {
      case "satellite":
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution: "&copy; <a href='https://www.esri.com/'>Esri</a>",
        };
      default:
        return {
          url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attribution: "&copy; <a href='https://carto.com/'>CartoDB</a> | &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a>",
        };
    }
  };

  const tileConfig = getTileLayer();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={cardHover}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="border border-slate-300 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mb-3 border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          <Layers3 className="h-3.5 w-3.5" />
          Map Controls
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Zoom limited to {minZoom}x - {maxZoom}x</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setViewMode("standard");
              setBaseLayer("grayscale");
            }}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "standard" && baseLayer === "grayscale"
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            Standard (Grayscale)
          </button>
          <button
            onClick={() => setBaseLayer("satellite")}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${
              baseLayer === "satellite"
                ? "border-brand-700 bg-brand-800 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setViewMode("pollution-density")}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "pollution-density"
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            Pollution Density
          </button>
        </div>
      </div>

      <div className="relative h-[620px] overflow-hidden border border-slate-300 dark:border-slate-700">
        <MapContainer
          key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
          center={mapCenter}
          zoom={mapZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          className="z-10 h-full w-full"
        >
          <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />

          {viewMode === "standard" &&
            safeCities.map((city) => (
              <CircleMarker
                key={`city-${city.id}`}
                center={city.safePosition}
                radius={selectedCity?.id === city.id ? 8 : 6}
                pathOptions={{
                  color: "#1d4ed8",
                  fillColor: selectedCity?.id === city.id ? "#1d4ed8" : "#93c5fd",
                  fillOpacity: 0.95,
                  weight: 2,
                }}
                eventHandlers={{ click: () => onSelectCity(city.id) }}
              />
            ))}

          {viewMode === "pollution-density" &&
            densityCells.map((cell) => (
              <Rectangle
                key={cell.id}
                bounds={cell.bounds}
                pathOptions={{
                  color: "transparent",
                  fillColor: cell.fillColor,
                  fillOpacity: cell.fillOpacity,
                  weight: 0,
                }}
              />
            ))}
        </MapContainer>

        {viewMode === "pollution-density" && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] border border-slate-300 bg-white/95 px-3 py-2 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
            Pollution Density Scale: gridded grey shading, light = low pollution and dark = high pollution
            <div className="mt-2 flex items-center gap-1">
              {["#f5f5f5", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#1f2937"].map((shade) => (
                <span key={shade} className="inline-block h-3 w-5 border border-slate-400" style={{ backgroundColor: shade }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
