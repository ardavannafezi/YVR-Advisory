"use client";

import { motion } from "framer-motion";

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      className={`card-surface rounded-none overflow-hidden ${className}`}
    >
      <div className="h-56 bg-white/[0.05]" />
      <div className="p-5 space-y-3">
        <div className="h-2.5 w-1/3 bg-white/[0.06] rounded-sm" />
        <div className="h-5 w-2/3 bg-white/[0.08] rounded-sm" />
        <div className="h-3 w-full bg-white/[0.05] rounded-sm mt-2" />
        <div className="h-3 w-4/5 bg-white/[0.05] rounded-sm" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-16 bg-white/[0.06] rounded-sm" />
          <div className="h-5 w-12 bg-white/[0.06] rounded-sm" />
          <div className="h-5 w-14 bg-white/[0.06] rounded-sm" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
