"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "yvr_events_quiz";

const STEPS = [
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
    question: "What type of venue?",
    key: "venue_type",
    options: [
      { label: "Nightclub", value: "Nightclub" },
      { label: "Cocktail Bar", value: "Cocktail Bar" },
      { label: "Bar & Restaurant", value: "Bar & Restaurant" },
      { label: "Rooftop Lounge", value: "Rooftop Lounge" },
      { label: "No Preference", value: "" },
    ],
  },
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
      // Save in EventsQuiz format so it auto-fires recommendations
      const prefs = {
        music_types: next.music_type ? [next.music_type] : [],
        venue_types: next.venue_type ? [next.venue_type] : [],
        date: next.date || null,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch {}
      router.push("/events");
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
