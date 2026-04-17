import { cityCatalog, cityInsights } from "../data/mockDashboardData";

export function getCityAqiRows() {
  return cityCatalog
    .map((city) => {
      const insight = cityInsights[city.id];
      const latestTrend = insight?.trendData?.[insight.trendData.length - 1];
      const aqi = typeof latestTrend?.aqi === "number" ? latestTrend.aqi : null;
      if (aqi === null) return null;

      return {
        ...city,
        aqi,
      };
    })
    .filter(Boolean);
}

function getPollutantValue(cityId, pollutantKey) {
  const insight = cityInsights[cityId];
  const card = insight?.summaryCards?.find((item) => item.id === pollutantKey);
  return typeof card?.value === "number" ? card.value : null;
}

export function getPollutantRows(pollutantKey) {
  return cityCatalog
    .map((city) => {
      const value = getPollutantValue(city.id, pollutantKey);
      if (value === null) return null;

      return {
        ...city,
        value,
      };
    })
    .filter(Boolean);
}

export function getForestCoverageRows() {
  return getCityAqiRows().map((city) => {
    const forestCoverage = Math.max(12, Math.min(42, Math.round(38 - city.aqi * 0.11)));
    return {
      ...city,
      forestCoverage,
    };
  });
}

export function getActivePlantationRows() {
  return getCityAqiRows().map((city) => {
    const activePlantationBlocks = Math.max(18, Math.round(30 + city.aqi * 0.32));
    const annualSaplings = Math.max(12000, Math.round(activePlantationBlocks * 620));
    return {
      ...city,
      activePlantationBlocks,
      annualSaplings,
    };
  });
}

export function getPolicyStatusRows() {
  return getCityAqiRows().map((city) => {
    let status = "Active - Phase 2";
    if (city.aqi <= 105) status = "Stabilization";
    else if (city.aqi >= 150) status = "Active - Phase 2";
    else if (city.aqi >= 130) status = "Active - Phase 1";

    return {
      ...city,
      status,
    };
  });
}
