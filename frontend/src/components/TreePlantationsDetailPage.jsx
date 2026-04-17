import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sprout } from "lucide-react";
import Navbar from "./Navbar";
import {
  plantationBenefits,
  ngoLinks,
  plantationProgramLinks,
} from "../data/environment/forestryInitiativesData";
import { getActivePlantationRows } from "../utils/cityEnvironmentalMetrics";

export default function TreePlantationsDetailPage({ darkMode, onToggleDarkMode, cityCount }) {
  const cityRows = getActivePlantationRows();
  const averagePlantations = cityRows.length
    ? Math.round(cityRows.reduce((sum, city) => sum + city.activePlantationBlocks, 0) / cityRows.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-100 pb-6 dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} cityCount={cityCount} />
      <main className="mx-auto mt-4 grid max-w-[1250px] gap-4 px-4 md:px-6">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-content-center border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Tree Plantations</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Benefits, implementation ecosystem, and city-level activity</p>
              </div>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <article className="border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average Active Plantation Blocks</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-brand-700 dark:text-brand-300">{averagePlantations}</p>
            </article>
            <article className="border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Coverage Type</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">Roadside, institutional, peri-urban, and watershed buffers</p>
            </article>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Benefits of Active Plantations</h3>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {plantationBenefits.map((benefit) => (
              <article key={benefit} className="border border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                {benefit}
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">NGOs Working on Tree Plantations</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Open each organization link for campaigns, volunteer drives, and collaboration channels.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {ngoLinks.map((ngo) => (
              <article key={ngo.name} className="border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ngo.name}</p>
                <a href={ngo.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-brand-700 underline underline-offset-2 dark:text-brand-300">
                  {ngo.url}
                </a>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Programs Conducting Tree Plantations</h3>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {plantationProgramLinks.map((program) => (
              <article key={program.name} className="border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{program.name}</p>
                <a href={program.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-brand-700 underline underline-offset-2 dark:text-brand-300">
                  {program.url}
                </a>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">City Plantation Activity Notes</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">City records are shown as individual narrative cards, not as a table.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {cityRows.map((city) => (
              <article key={city.id} className="border border-slate-300 bg-gradient-to-br from-blue-100 to-blue-50 p-3 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{city.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{city.state}</p>
                <p className="mt-2 text-xl font-extrabold text-brand-700 dark:text-brand-300">{city.activePlantationBlocks} active blocks</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Annual plantation throughput is estimated around {city.annualSaplings.toLocaleString()} saplings, based on current intervention density and planning pressure.
                </p>
              </article>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
