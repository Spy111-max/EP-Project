export const aqiBands = [
  { label: "Good", max: 50, color: "bg-emerald-500", text: "text-emerald-600", tone: "from-emerald-100 to-emerald-50" },
  { label: "Moderate", max: 100, color: "bg-yellow-500", text: "text-yellow-600", tone: "from-yellow-100 to-yellow-50" },
  { label: "Unhealthy", max: 150, color: "bg-orange-500", text: "text-orange-600", tone: "from-orange-100 to-orange-50" },
  { label: "Severe", max: Infinity, color: "bg-red-500", text: "text-red-600", tone: "from-red-100 to-red-50" },
];

export function getAQIBand(value) {
  return aqiBands.find((band) => value <= band.max) || aqiBands[aqiBands.length - 1];
}
