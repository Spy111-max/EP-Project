import { motion } from "framer-motion";
import TreeRecommendationCard from "./TreeRecommendationCard";
import { cardHover } from "../animations/variants";

export default function TreeRecommendationsPanel({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Tree Recommendations</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Select a city first to generate location-aware species recommendations.
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={cardHover}
      transition={{ duration: 0.3 }}
      className="border border-slate-300 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Tree Recommendations</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Species prioritized for current pollution and land context</p>
        </div>
        <span className="border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          {recommendations.length} candidates
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
        {recommendations.map((item, index) => (
          <TreeRecommendationCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </motion.section>
  );
}
