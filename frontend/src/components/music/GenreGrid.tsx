"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/styles/animations";
import { usePreferenceTracker } from "@/hooks/usePreferenceTracker";
import type { Genre } from "@/types";

const GENRE_COLORS: Record<string, string> = {
  house: "from-blue-900/40",
  techno: "from-purple-900/40",
  "hip-hop": "from-yellow-900/40",
  "r&b": "from-pink-900/40",
  "top 40": "from-cyan-900/40",
  latin: "from-red-900/40",
  afrobeats: "from-amber-900/40",
  dancehall: "from-lime-900/40",
  reggaeton: "from-orange-900/40",
  edm: "from-green-900/40",
  live: "from-rose-900/40",
};

export function GenreGrid({ genres }: { genres: Genre[] }) {
  const { trackMusicView } = usePreferenceTracker();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {genres.map((g, i) => (
        <motion.div key={g.genre} variants={fadeUp} custom={i}>
          <Link
            href={`/music/${g.genre}`}
            onClick={() => trackMusicView(g.genre)}
            className={`group block card-surface p-8 text-center bg-gradient-to-b ${GENRE_COLORS[g.genre] || "from-white/5"} to-transparent hover:border-gold/40 transition-all duration-300`}
          >
            <h3 className="font-serif text-2xl text-text-primary group-hover:text-gold transition-colors capitalize mb-1">
              {g.genre}
            </h3>
            <p className="text-text-dim text-xs uppercase tracking-widest">
              {g.venue_count} {g.venue_count === 1 ? "venue" : "venues"}
            </p>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
