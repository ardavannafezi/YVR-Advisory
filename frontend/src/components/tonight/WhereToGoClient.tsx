"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    question: "When are you going out?",
    key: "date",
    options: [
      { label: "Tonight", value: "tonight" },
      { label: "This Weekend", value: "weekend" },
      { label: "This Week", value: "week" },
      { label: "Any Time", value: "" },
    ],
  },
  {
    question: "What's your music?",
    key: "music_type",
    options: [
      { label: "House", value: "house" },
      { label: "Techno", value: "techno" },
      { label: "Hip-Hop", value: "hip-hop" },
      { label: "R&B", value: "r&b" },
      { label: "Top 40", value: "top 40" },
      { label: "Latin", value: "latin" },
      { label: "Afrobeats", value: "afrobeats" },
      { label: "Dancehall", value: "dancehall" },
      { label: "Reggaeton", value: "reggaeton" },
      { label: "EDM", value: "edm" },
      { label: "Live", value: "live" },
      { label: "No Preference", value: "" },
    ],
  },
  {
    question: "How do you want in?",
    key: "entry_type",
    options: [
      { label: "Guestlist", value: "guestlist" },
      { label: "Bottle Service", value: "reservation" },
      { label: "Tickets", value: "tickets" },
      { label: "No Preference", value: "" },
    ],
  },
];

export function WhereToGoClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function select(key: string, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const qs = new URLSearchParams();
      if (next.date) qs.set("date", next.date);
      if (next.music_type) qs.set("music_type", next.music_type);
      if (next.entry_type) qs.set("entry_type", next.entry_type);
      router.push(`/events${qs.toString() ? `?${qs}` : ""}`);
    }
  }

  const current = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-px bg-white/[0.06] relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gold"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">
              {step + 1} / {STEPS.length}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-10">
              {current.question}
            </h2>
            <div className="flex flex-col gap-3">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => select(current.key, opt.value)}
                  className="w-full text-left px-6 py-4 border border-white/10 text-text-muted text-sm uppercase tracking-widest hover:border-gold/50 hover:text-gold hover:bg-gold/5 transition-all duration-200"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-10 text-[10px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
