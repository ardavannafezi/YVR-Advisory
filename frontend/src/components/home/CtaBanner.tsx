"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GoldButton } from "@/components/ui/GoldButton";
import { goldDivider } from "@/styles/animations";

export function CtaBanner() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gold text-xs uppercase tracking-[0.4em] mb-6"
        >
          Your Advisor
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-4xl md:text-6xl text-text-primary leading-tight mb-4"
        >
          Not Sure Where to Go?
        </motion.h2>
        <motion.div
          variants={goldDivider}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto h-px w-16 bg-gold mb-6 origin-center"
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-text-muted mb-10 leading-relaxed"
        >
          Answer a few quick questions and we&apos;ll match you to the perfect venue or event for tonight.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/tonight">
            <GoldButton size="lg">Get My Recommendation</GoldButton>
          </Link>
          <Link href="/guestlist">
            <GoldButton size="lg" variant="outline">Join the Guestlist</GoldButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
