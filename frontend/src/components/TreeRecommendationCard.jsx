import { motion } from "framer-motion";
import { cardHover } from "../animations/variants";

export default function TreeRecommendationCard({ item, index, onOpenDetails }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.03 * index }}
      whileHover={cardHover}
      whileTap={{ scale: 0.995 }}
      className="border border-slate-300 bg-gradient-to-br from-white to-slate-50 p-3 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800"
      title={item.reason}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenDetails?.(item)}
          className="text-left text-sm font-bold text-slate-900 underline-offset-2 transition hover:underline dark:text-white"
        >
          {item.commonName}
        </button>
        <span className="border border-brand-200 bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          Match {item.match}%
        </span>
      </div>
      <p className="text-xs italic text-slate-500 dark:text-slate-400">{item.scientificName}</p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
        <div className="border border-slate-200 bg-slate-100 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500">Growth</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{item.growthYears}y</p>
        </div>
        <div className="border border-slate-200 bg-slate-100 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500">Carbon</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{item.carbon} kg/y</p>
        </div>
        <div className="border border-slate-200 bg-slate-100 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500">Suitability</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{item.suitability}</p>
        </div>
      </div>
    </motion.article>
  );
}
