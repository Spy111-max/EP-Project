import { motion } from "framer-motion";

export default function LoadingSkeleton({ className = "h-6 w-full" }) {
  return (
    <motion.div
      initial={{ opacity: 0.55 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`animate-pulse rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 ${className}`}
      aria-hidden="true"
    />
  );
}
