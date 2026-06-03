"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp } from "@/styles/animations";

const PILLARS = [
  {
    number: "01",
    title: "Curated Venues",
    body: "We handpick Vancouver's finest nightclubs, cocktail bars, and lounges — venues that meet our standard for atmosphere, service, and experience.",
  },
  {
    number: "02",
    title: "Live Events",
    body: "Techno nights, hip-hop sessions, rooftop parties — we track the events worth your night, so you never miss what matters in Vancouver.",
  },
  {
    number: "03",
    title: "Honest Advice",
    body: "Tell us your vibe, your group, your budget. Our advisor matches you to the right place — no commissions, no affiliations. Just guidance.",
  },
];

export function AdvisorSection() {
  return (
    <section className="py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
          <div>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-gold text-[10px] uppercase tracking-[0.4em] mb-5"
            >
              The Advisory
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-sans font-bold text-4xl md:text-5xl text-text-primary leading-tight"
            >
              Your Guide to
              <br />
              <span className="text-gold">Vancouver Nights</span>
            </motion.h2>
          </div>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-text-muted text-base leading-relaxed lg:max-w-md"
          >
            YVR Advisory is Vancouver&apos;s independent nightlife guide. We&apos;re not affiliated with any venue or promoter — we scout, curate, and advise so you spend less time wondering and more time experiencing the best nights the city has to offer.
          </motion.p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.number}
              variants={fadeUp}
              custom={i + 3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="px-0 md:px-10 py-10 md:py-0 first:pl-0 last:pr-0"
            >
              <p className="text-gold/40 text-[10px] uppercase tracking-[0.3em] mb-6 font-mono">{p.number}</p>
              <h3 className="font-sans font-semibold text-xl text-text-primary mb-3">{p.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>

        {/* SEO context paragraph */}
        <motion.div
          variants={fadeUp}
          custom={7}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-white/[0.05] flex flex-col sm:flex-row sm:items-end gap-8"
        >
          <p className="text-text-dim text-sm leading-loose flex-1 max-w-3xl">
            From late-night clubs on Granville Street to cocktail bars in Gastown, rooftop lounges in Yaletown, and hidden gems across the city — YVR Advisory covers the full spectrum of Vancouver nightlife.
            Whether you&apos;re looking for events tonight in Vancouver, planning a weekend night out, or finding the right venue for a special occasion, we keep our listings current and our advice honest.
          </p>
          <Link
            href="/tonight"
            className="flex-shrink-0 text-[10px] uppercase tracking-widest text-gold border border-gold/30 px-6 py-3 hover:bg-gold/10 transition-colors whitespace-nowrap"
          >
            Get Advised →
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
