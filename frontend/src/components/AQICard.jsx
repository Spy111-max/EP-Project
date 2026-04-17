import { motion } from "framer-motion";
import { getAQIBand } from "../utils/aqi";
import CountUpValue from "./CountUpValue";
import { cardHover } from "../animations/variants";

export default function AQICard({ label, value, unit, hint, onClick }) {
  const band = getAQIBand(value);
  const decimals = Number.isInteger(value) ? 0 : 1;
  const CardTag = onClick ? motion.button : motion.article;

  return (
    <CardTag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      whileHover={cardHover}
      whileTap={{ scale: 0.995 }}
      className={`block h-full w-full border border-slate-300 bg-gradient-to-br ${band.tone} p-3 text-left shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${band.color}`} title={`Status band: ${band.label}`} />
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        <CountUpValue value={value} decimals={decimals} />
        <span className="ml-2 text-base font-medium text-slate-500 dark:text-slate-400">{unit}</span>
      </p>
      <div className="mt-2 flex items-center justify-between">
        <p className={`text-sm font-semibold ${band.text}`}>{band.label}</p>
        <div className="group relative">
          <p className="cursor-help text-xs text-slate-500 dark:text-slate-400">About</p>
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            whileInView={{ opacity: 0 }}
            className="pointer-events-none absolute right-0 top-5 z-20 w-40 border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 dark:border-slate-300 dark:bg-slate-100 dark:text-slate-900"
          >
            {hint}
          </motion.p>
        </div>
      </div>
    </CardTag>
  );
}
