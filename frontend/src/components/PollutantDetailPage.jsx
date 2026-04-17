import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Beaker } from "lucide-react";
import Navbar from "./Navbar";
import { getAQIBand } from "../utils/aqi";
import { getPollutantRows } from "../utils/cityEnvironmentalMetrics";
import { getPollutantDetails } from "../data/environment/pollutantDetailsData";

export default function PollutantDetailPage({ darkMode, onToggleDarkMode, cityCount }) {
  const { pollutantKey } = useParams();
  const pollutant = getPollutantDetails(pollutantKey);
  const rows = getPollutantRows(pollutantKey);
  const averageValue = rows.length ? Math.round(rows.reduce((sum, city) => sum + city.value, 0) / rows.length) : 0;
  const averageBand = getAQIBand(averageValue);

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
                <Beaker className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{pollutant.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{pollutant.label} explained for the dashboard</p>
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
            <p>{pollutant.whatItIs}</p>
            <p>{pollutant.howCalculated}</p>
            <p>{pollutant.healthNote}</p>
          </div>

          <div className="mt-4 grid gap-3 border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average {pollutant.label}</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{averageValue}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average Reference Band</p>
              <p className={`mt-1 text-lg font-semibold ${averageBand.text}`}>{averageBand.label}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cities Covered</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{rows.length}</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">{pollutant.label} by City</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Each city is displayed as a separate block, not a table.</p>

          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((city) => {
              const band = getAQIBand(city.value);
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

                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{city.value}</p>
                  <p className={`mt-1 text-sm font-semibold ${band.text}`}>{band.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {city.name} currently shows {pollutant.label} at {city.value} based on the latest city snapshot.
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
