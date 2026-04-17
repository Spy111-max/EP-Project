import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet";
import { cardHover } from "../animations/variants";
import { Layers3 } from "lucide-react";

export default function MapPreview({ cities, selectedCity, hotspots, selectedHotspots, onSelectCity }) {
  const [baseLayer, setBaseLayer] = useState("grayscale");
  const [showPollutionDensity, setShowPollutionDensity] = useState(true);
  const hasSelectedCity = Boolean(selectedCity?.id);

  const indiaBounds = [
    [6.0, 68.0],
    [38.5, 97.5],
  ];

  const fallbackCenter = [22.9734, 78.6569];
  const mapCenter = isValidLatLng(selectedCity?.position) ? selectedCity.position : fallbackCenter;
  const mapZoom = selectedCity ? 7 : 5;
  const minZoom = 4;
  const maxZoom = 12;
  const lastUpdated = new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

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
      safeColor: typeof spot.color === "string" ? spot.color : null,
    }));

  const safeSelectedHotspots = (selectedHotspots || [])
    .filter((spot) => isValidLatLng(spot.position))
    .map((spot) => ({
      ...spot,
      safePosition: [Number(spot.position[0]), Number(spot.position[1])],
      safeAqi: Number.isFinite(spot.aqi) ? spot.aqi : 100,
      safeColor: typeof spot.color === "string" ? spot.color : null,
    }));

  function getGrayDensityColor(aqi) {
    if (aqi >= 170) return "#1f1f1f";
    if (aqi >= 140) return "#404040";
    if (aqi >= 110) return "#737373";
    return "#d4d4d4";
  }

  function getGrayDensityColor(aqi) {
    if (aqi >= 170) return "#1f1f1f";
    if (aqi >= 140) return "#404040";
    if (aqi >= 110) return "#737373";
    return "#d4d4d4";
  }

  const circleRadius = 30;

  function buildDensityCircle(spot, index, selectedMode) {
    const aqi = Number.isFinite(spot.safeAqi) ? spot.safeAqi : 100;
    const color = getGrayDensityColor(aqi);
    const opacity = selectedMode
      ? aqi >= 170
        ? 0.3
        : aqi >= 140
          ? 0.26
          : aqi >= 110
            ? 0.22
            : 0.18
      : aqi >= 170
        ? 0.28
        : aqi >= 140
          ? 0.24
          : aqi >= 110
            ? 0.18
            : 0.12;

    return {
      id: `${spot.id}-${selectedMode ? "selected" : "neutral"}-${index}`,
      center: spot.safePosition,
      radius: circleRadius,
      color,
      fillOpacity: opacity,
      weight: selectedMode && aqi >= 140 ? 2 : 1,
    };
  }

  const pollutionCircles = useMemo(
    () => safeSelectedHotspots.map((spot, index) => buildDensityCircle(spot, index, true)),
    [safeSelectedHotspots],
  );

  const neutralDensityCircles = useMemo(() => {
    const cityDotRadius = 6;

    return safeHotspots.length > 0
      ? safeHotspots.map((spot, index) => {
          return {
            ...buildDensityCircle(spot, index, false),
            radius: cityDotRadius * 5,
          };
        })
      : safeCities.map((city, index) => {
          return {
            id: `${city.id}-neutral-density`,
            center: city.safePosition,
            radius: cityDotRadius * 5,
            color: ["#e5e7eb", "#d1d5db", "#cbd5e1", "#9ca3af"][index % 4],
            fillOpacity: [0.12, 0.15, 0.18, 0.2][index % 4],
          };
        });
  }, [safeCities, safeHotspots]);

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
            onClick={() => setBaseLayer("grayscale")}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${
              baseLayer === "grayscale"
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            Grayscale Basemap
          </button>
          <button
            onClick={() => setBaseLayer("satellite")}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${
              baseLayer === "satellite"
                ? "border-brand-700 bg-brand-800 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setShowPollutionDensity((prev) => !prev)}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${
              showPollutionDensity
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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

          {!hasSelectedCity &&
            neutralDensityCircles.map((layer) => (
              <CircleMarker
                key={layer.id}
                center={layer.center}
                radius={layer.radius}
                pathOptions={{
                  color: layer.color,
                  fillColor: layer.color,
                  fillOpacity: layer.fillOpacity,
                  weight: 1,
                }}
              />
            ))}

          {hasSelectedCity && showPollutionDensity &&
            pollutionCircles.map((layer) => (
              <CircleMarker
                key={layer.id}
                center={layer.center}
                radius={layer.radius}
                pathOptions={{
                  color: layer.color,
                  fillColor: layer.color,
                  fillOpacity: layer.fillOpacity,
                  weight: layer.weight,
                }}
              />
            ))}

          {safeCities.map((city) => (
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
        </MapContainer>

        <div className="absolute right-3 top-3 z-[1000] border border-slate-300 bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
          Source: Department of Environmental Statistics, 2026. Updated: {lastUpdated}
        </div>
      </div>
    </motion.section>
  );
}
