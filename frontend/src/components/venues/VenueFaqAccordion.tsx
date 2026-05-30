"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { VenueFaq } from "@/types";

export function VenueFaqAccordion({ faqs }: { faqs: VenueFaq[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col divide-y divide-white/5">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left gap-4 group"
          >
            <span className="text-text-primary text-sm group-hover:text-gold transition-colors">
              {faq.question}
            </span>
            <span className={`text-gold text-lg leading-none transition-transform duration-200 shrink-0 ${open === i ? "rotate-45" : ""}`}>
              +
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="text-text-muted text-sm leading-relaxed pb-4">{faq.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
