"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const LINE1 = ["Where", "Will", "You"];
const LINE2 = ["Go", "Tonight?"];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);

  return (
    <section ref={ref} className="relative h-screen flex items-center overflow-hidden">
      {/* Background + cinematic gradients */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        {/* Left-to-right: dark left panel for text (desktop only) */}
        <div className="absolute inset-0 z-10 hidden lg:block bg-gradient-to-r from-[#030209] via-[#030209]/85 to-[#030209]/5" />
        {/* Top vignette */}
        <div className="absolute inset-0 z-[9] bg-gradient-to-b from-[#030209]/70 via-transparent to-transparent" />
        {/* Bottom fade into site */}
        <div className="absolute inset-0 z-[9] bg-gradient-to-t from-[#030209] via-[#030209]/20 to-transparent" />
        {/* Mobile: full dark overlay */}
        <div className="absolute inset-0 z-10 lg:hidden bg-[#030209]/65" />
        {/* Image */}
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/hero-bg.jpg'), url('https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1920&q=80')",
          }}
        />
      </motion.div>

      {/* Content — left-aligned desktop, centered mobile */}
      <div className="relative z-20 w-full px-8 md:px-16 lg:px-20 xl:px-28 flex lg:block items-center justify-center text-center lg:text-left">
        <div className="max-w-xl lg:max-w-2xl">

          {/* Location badge */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center gap-3 mb-9 justify-center lg:justify-start"
          >
            <div className="w-6 h-px bg-gold" />
            <p className="text-[9px] uppercase tracking-[0.55em] text-gold">Vancouver, BC</p>
            <div className="w-6 h-px bg-gold" />
          </motion.div>

          {/* Word-by-word headline */}
          <h1 className="font-serif text-6xl md:text-7xl xl:text-[88px] text-text-primary leading-[0.88] mb-9">
            <span className="block mb-1">
              {LINE1.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block mr-[0.24em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block text-gold">
              {LINE2.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.63 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block mr-[0.24em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Gold rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="h-px w-14 bg-gold mb-7 origin-left mx-auto lg:mx-0"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.08 }}
            className="text-text-muted text-sm md:text-base leading-relaxed mb-11 max-w-sm mx-auto lg:mx-0"
          >
            Your independent advisor for Vancouver&apos;s finest nightclubs, bars, and events — curated, unbiased, always current.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.22 }}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
          >
            <Link
              href="/tonight"
              className="inline-flex items-center justify-center uppercase text-[10px] font-bold tracking-[0.22em] bg-gold text-[#030209] px-9 py-4 hover:bg-gold-light transition-colors duration-200"
            >
              Advise Me Tonight
            </Link>
            <Link
              href="/venues"
              className="inline-flex items-center justify-center uppercase text-[10px] tracking-[0.22em] border border-white/20 text-text-primary px-9 py-4 hover:border-gold/50 hover:text-gold transition-colors duration-200"
            >
              Explore Venues
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Vertical scroll label — desktop right side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 1.9 }}
        className="absolute bottom-12 right-10 lg:right-16 z-20 hidden lg:flex flex-col items-center gap-3"
      >
        <span
          className="text-text-dim text-[9px] uppercase tracking-[0.35em]"
          style={{ writingMode: "vertical-rl", letterSpacing: "0.3em" }}
        >
          Scroll
        </span>
        <div className="w-px h-14 bg-gradient-to-b from-gold/40 to-transparent" />
      </motion.div>
    </section>
  );
}
