"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const LINE1 = ["Where", "Will", "You"];
const LINE2 = ["Go", "Tonight?"];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        {/* Light uniform darkening so image reads clearly */}
        <div className="absolute inset-0 z-10 bg-black/35" />
        {/* Bottom fade into page — tighter so image shows more */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#080808] via-[#080808]/10 to-transparent" />
        {/* Top vignette for nav contrast */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        {/* Image — bg-center on desktop, shift slightly up for skylines on mobile */}
        <div
          className="w-full h-full bg-cover bg-center sm:bg-[center_40%]"
          style={{
            backgroundImage: "url('/hero-bg.jpg'), url('/kharl-unsplash.jpg')",
          }}
        />
      </motion.div>

      {/* Content — centered */}
      <div className="relative z-20 text-center px-6 max-w-4xl mx-auto w-full">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-6 h-px bg-gold" />
          <p className="text-[9px] uppercase tracking-[0.55em] text-gold">Vancouver, BC</p>
          <div className="w-6 h-px bg-gold" />
        </motion.div>

        <h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl xl:text-[88px] text-text-primary leading-[0.9] mb-8"
          style={{ textShadow: "0 2px 24px rgba(0,0,0,0.7)" }}
        >
          <span className="block mb-1">
            {LINE1.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.24em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="block text-gold" style={{ textShadow: "0 2px 32px rgba(0,0,0,0.9), 0 0 60px rgba(201,168,76,0.25)" }}>
            {LINE2.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.63 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.24em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="h-px w-14 bg-gold mx-auto mb-7 origin-center"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.08 }}
          className="text-white/80 text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.8)" }}
        >
          Your advisor for Vancouver&apos;s finest nightclubs, bars, and events — curated recommendations, guestlist access, always current.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.22 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/where-to-go"
            className="inline-flex items-center justify-center uppercase text-[10px] font-bold tracking-[0.22em] bg-gold text-[#080808] px-9 py-4 hover:bg-gold-light transition-colors duration-200"
          >
            Advise Me Tonight
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center uppercase text-[10px] tracking-[0.22em] border border-white/30 text-text-primary px-9 py-4 hover:border-gold/60 hover:text-gold transition-colors duration-200"
          >
            Explore Events
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.9 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-text-dim">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold/40 to-transparent" />
      </motion.div>
    </section>
  );
}
