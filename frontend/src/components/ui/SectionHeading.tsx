"use client";

import { motion } from "framer-motion";
import { fadeUp, goldDivider } from "@/styles/animations";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeading({ eyebrow, title, subtitle, center = false }: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      {eyebrow && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-gold text-xs uppercase tracking-[0.3em] mb-4"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        variants={fadeUp}
        custom={1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="font-serif text-4xl md:text-5xl text-text-primary leading-tight"
      >
        {title}
      </motion.h2>
      <motion.div
        variants={goldDivider}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`mt-4 h-px w-16 bg-gold origin-left ${center ? "mx-auto" : ""}`}
      />
      {subtitle && (
        <motion.p
          variants={fadeUp}
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-4 text-text-muted max-w-xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
