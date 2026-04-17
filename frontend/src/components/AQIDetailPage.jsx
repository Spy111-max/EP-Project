import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Activity } from "lucide-react";
import Navbar from "./Navbar";
import { cityCatalog, cityInsights } from "../data/mockDashboardData";
import { getAQIBand } from "../utils/aqi";

function getLatestAqi(cityId) {
  const insight = cityInsights[cityId];
  const latestTrend = insight?.trendData?.[insight.trendData.length - 1];
  return typeof latestTrend?.aqi === "number" ? latestTrend.aqi : null;
}

export default function AQIDetailPage({ darkMode, onToggleDarkMode, cityCount }) {
  const cityRows = cityCatalog
    .map((city) => ({
      ...city,
      aqi: getLatestAqi(city.id),
    }))
    .filter((city) => typeof city.aqi === "number");

  const averageAqi = cityRows.length
    ? Math.round(cityRows.reduce((sum, city) => sum + city.aqi, 0) / cityRows.length)
    : 0;
  const averageBand = getAQIBand(averageAqi);

  return (
    <div className="min-h-screen bg-slate-100 pb-6 dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} cityCount={cityCount} />

      <main className="mx-auto mt-4 grid max-w-[1200px] gap-4 px-4 md:px-6">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-content-center border border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-700 dark:bg-danger-900/30 dark:text-danger-200">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">AQI Index</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">How it works and what each city is currently showing</p>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>
              AQI, or Air Quality Index, is a single number used to describe how clean or polluted the air is at a given location.
              Smaller numbers mean cleaner air, while larger numbers mean a stronger pollution load and a higher health burden.
            </p>
            <p>
              In this dashboard, the AQI shown for each city is taken from the latest pollution trend value for that city. The
              broader index is then averaged across all selected cities to give a one-line view of the overall air quality condition
              across the full region.
            </p>
            <p>
              The AQI bands are interpreted in the same way as the rest of the dashboard: good air is shown in the lower range,
              moderate air sits in the middle range, and unhealthy to severe air shifts into the higher range.
            </p>
          </div>

          <div className="mt-4 grid gap-3 border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average AQI Index</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{averageAqi}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average Band</p>
              <p className={`mt-1 text-lg font-semibold ${averageBand.text}`}>{averageBand.label}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cities Covered</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{cityRows.length}</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">AQI by City</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Each city is shown separately, with no table layout, so the values stay easy to scan on smaller screens.
          </p>

          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {cityRows.map((city) => {
              const band = getAQIBand(city.aqi);
              return (
                <article
                  key={city.id}
                  className={`border border-slate-300 bg-gradient-to-br ${band.tone} p-3 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{city.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{city.state}</p>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${band.color}`} title={band.label} />
                  </div>

                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{city.aqi}</p>
                  <p className={`mt-1 text-sm font-semibold ${band.text}`}>{band.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {city.name} is currently reading at an AQI level that falls under the {band.label.toLowerCase()} band.
                    Higher values here indicate a stronger pollution load and a greater need for source control and planting
                    intervention.
                  </p>
                </article>
              );
            })}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
