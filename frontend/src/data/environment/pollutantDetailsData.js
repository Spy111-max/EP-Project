export const pollutantDetailsByKey = {
  pm25: {
    label: "PM2.5",
    title: "PM2.5 Detail",
    whatItIs:
      "PM2.5 refers to fine particulate matter with a diameter of 2.5 micrometers or less. These particles are small enough to penetrate deep into the lungs and are a key indicator for traffic smoke, combustion, and industrial haze.",
    howCalculated:
      "On this dashboard, the value shown for each city is taken from the current city pollution snapshot. The page average is the arithmetic mean of all city values currently loaded in the dashboard data.",
    healthNote:
      "Higher PM2.5 values generally indicate greater respiratory stress and a stronger need for emission reduction, roadside greening, and dust suppression.",
  },
  pm10: {
    label: "PM10",
    title: "PM10 Detail",
    whatItIs:
      "PM10 is coarse particulate matter that includes dust, road resuspension, construction debris, and larger combustion particles. It is often visible as haze, dust, or a dulling of the city skyline.",
    howCalculated:
      "For this dashboard, each city value is taken from the active air-quality snapshot in the dashboard data. The average displayed on the page is the arithmetic mean across all available city records.",
    healthNote:
      "Elevated PM10 often points to construction dust, road dust, and open-area particulates that need sweeping, watering, and barrier planting.",
  },
  pm1: {
    label: "PM1",
    title: "PM1 Detail",
    whatItIs:
      "PM1 refers to ultrafine particulate matter with a diameter of 1 micrometer or less. It represents the smallest and most penetrating part of the particulate load and is useful for understanding the finest pollution burden.",
    howCalculated:
      "In this dashboard, PM1 is stored alongside the city pollutant snapshot and displayed as part of the selected city summary. The average shown on this page is the arithmetic mean across all loaded cities.",
    healthNote:
      "Because PM1 is so small, it can remain suspended longer and travel deeper into the respiratory system, making it a useful measure for high-precision pollution planning.",
  },
};

export function getPollutantDetails(key) {
  return pollutantDetailsByKey[key] || pollutantDetailsByKey.pm25;
}
