"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { goldDivider } from "@/styles/animations";

const LINE1 = ["Where", "Will", "You"];
const LINE2 = ["Go", "Tonight?"];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background — drop your photo at /public/hero-bg.jpg to override */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/75 via-black/25 to-background" />
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero-bg.jpg'), url('https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1920&q=80')",
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: textY }}
        className="relative z-20 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-gold text-[10px] uppercase tracking-[0.5em] mb-8"
        >
          Vancouver&apos;s Independent Nightlife Guide
        </motion.p>

        {/* Word-by-word headline */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-text-primary leading-[0.95] mb-8">
          <span className="block mb-1">
            {LINE1.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.28em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="block text-gold">
            {LINE2.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.63 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.28em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.div
          variants={goldDivider}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.95 }}
          className="mx-auto h-px w-16 bg-gold mb-8 origin-center"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          className="text-text-muted text-base md:text-lg max-w-lg mx-auto mb-12 leading-relaxed"
        >
          Your advisor for Vancouver&apos;s best nightclubs, bars, and events — curated and unbiased.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/tonight"
            className="inline-flex items-center justify-center uppercase text-[11px] tracking-widest bg-gold text-background px-10 py-4 hover:bg-gold-light transition-colors duration-200 font-semibold"
          >
            Advise Me Tonight
          </Link>
          <Link
            href="/venues"
            className="inline-flex items-center justify-center uppercase text-[11px] tracking-widest border border-gold/70 text-gold px-10 py-4 hover:bg-gold/10 transition-colors duration-200"
          >
            Explore Venues
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator — static, no bounce */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ delay: 1.9, duration: 0.9 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none"
      >
        <span className="text-text-dim text-[9px] uppercase tracking-[0.35em]">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold/40 to-transparent" />
      </motion.div>
    </section>
  );
}
