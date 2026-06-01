"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Event } from "@/types";

const STORAGE_KEY = "yvr_events_quiz";

const STEPS = [
  {
    key: "venue_types",
    question: "What type of venue?",
    hint: "Pick one or more",
    options: ["Nightclub", "Cocktail Bar", "Bar & Restaurant", "Rooftop Lounge"],
  },
  {
    key: "music_types",
    question: "What music are you into?",
    hint: "Select all that apply",
    options: ["hip-hop", "house", "techno", "latin", "r&b", "edm", "pop", "live"],
  },
  {
    key: "date",
    question: "When are you going?",
    hint: "Optional — skip to see all",
    options: ["Tonight", "This Weekend", "This Week"],
    optional: true,
  },
];

const DATE_MAP: Record<string, string> = {
  "Tonight": "tonight",
  "This Weekend": "weekend",
  "This Week": "week",
};

interface QuizState {
  venue_types: string[];
  music_types: string[];
  date: string | null;
}

interface Props {
  onResults: (results: Event[], similar: Event[]) => void;
  onSkip: () => void;
  listRef: React.RefObject<HTMLElement | null>;
}

export function EventsQuiz({ onResults, onSkip, listRef }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizState>({ venue_types: [], music_types: [], date: null });
  const [loading, setLoading] = useState(false);
  const [hasPrefs, setHasPrefs] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as QuizState;
        if (parsed.venue_types?.length || parsed.music_types?.length) {
          setAnswers(parsed);
          setHasPrefs(true);
        }
      }
    } catch {}
  }, []);

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  function toggleMulti(key: "venue_types" | "music_types", val: string) {
    setAnswers(prev => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
      };
    });
  }

  function toggleDate(val: string) {
    setAnswers(prev => ({
      ...prev,
      date: prev.date === DATE_MAP[val] ? null : DATE_MAP[val],
    }));
  }

  function canAdvance() {
    if (currentStep.optional) return true;
    const key = currentStep.key as "venue_types" | "music_types";
    return answers[key].length > 0;
  }

  async function advance() {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      await submit();
    }
  }

  function back() {
    setDirection(-1);
    setStep(s => s - 1);
  }

  async function submit() {
    setLoading(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      const res = await api.post<{ results: Event[]; similar: Event[] }>("/api/events/recommend", {
        venue_types: answers.venue_types,
        music_types: answers.music_types,
        date: answers.date,
      });
      onResults(res.results, res.similar);
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      onSkip();
    } finally {
      setLoading(false);
    }
  }

  function resetPrefs() {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({ venue_types: [], music_types: [], date: null });
    setHasPrefs(false);
    setStep(0);
  }

  async function usePrefs() {
    setLoading(true);
    try {
      const res = await api.post<{ results: Event[]; similar: Event[] }>("/api/events/recommend", {
        venue_types: answers.venue_types,
        music_types: answers.music_types,
        date: answers.date,
      });
      onResults(res.results, res.similar);
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      onSkip();
    } finally {
      setLoading(false);
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.25 } }),
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] px-6 py-16 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.03] blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-3">Event Discovery</p>
          <h1 className="font-serif text-4xl md:text-5xl text-text-primary">Find Your Night</h1>
        </div>

        {hasPrefs ? (
          /* Returning user — use saved prefs */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <p className="text-text-muted text-sm">Using your saved preferences.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[...answers.venue_types, ...answers.music_types].map(tag => (
                <span key={tag} className="text-[11px] px-3 py-1 border border-gold/40 text-gold uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={usePrefs}
                disabled={loading}
                className="bg-gold text-black text-sm px-8 py-3 font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Finding events…" : "Find Events"}
              </button>
              <button
                onClick={resetPrefs}
                className="text-sm text-text-muted border border-white/10 px-6 py-3 hover:border-white/25 transition-colors"
              >
                Reset preferences
              </button>
            </div>
            <button onClick={onSkip} className="text-xs uppercase tracking-widest text-text-muted border border-white/20 px-5 py-2 hover:border-white/40 hover:text-text-primary transition-colors">
              Skip — show all events
            </button>
          </motion.div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-text-dim">
                  Step {step + 1} of {STEPS.length}
                </span>
                <span className="text-[10px] text-text-dim">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
              </div>
              <div className="h-px bg-white/10 w-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold"
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="mb-8">
                  <h2 className="font-serif text-2xl md:text-3xl text-text-primary mb-1">
                    {currentStep.question}
                  </h2>
                  <p className="text-text-dim text-sm">{currentStep.hint}</p>
                </div>

                {/* Option tags */}
                <div className="flex flex-wrap gap-3">
                  {currentStep.options.map(opt => {
                    const key = currentStep.key;
                    let active = false;
                    if (key === "venue_types") active = answers.venue_types.includes(opt);
                    else if (key === "music_types") active = answers.music_types.includes(opt);
                    else if (key === "date") active = answers.date === DATE_MAP[opt];

                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          if (key === "venue_types") toggleMulti("venue_types", opt);
                          else if (key === "music_types") toggleMulti("music_types", opt);
                          else toggleDate(opt);
                        }}
                        className={`px-5 py-2.5 text-sm border transition-all duration-200 ${
                          active
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-white/15 text-text-muted hover:border-white/30 hover:text-text-primary"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
              <div>
                {step > 0 && (
                  <button
                    onClick={back}
                    className="text-[11px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={advance}
                  disabled={loading || (!canAdvance() && !currentStep.optional)}
                  className="bg-gold text-black text-sm px-8 py-3 font-medium hover:bg-gold/90 transition-colors disabled:opacity-40"
                >
                  {loading
                    ? "Finding events…"
                    : step < STEPS.length - 1
                    ? "Next →"
                    : "Find Events"}
                </button>
                {currentStep.optional && (
                  <button
                    onClick={advance}
                    disabled={loading}
                    className="text-xs uppercase tracking-widest text-text-muted border border-white/20 px-5 py-2 hover:border-white/40 hover:text-text-primary transition-colors"
                  >
                    Skip this step →
                  </button>
                )}
              </div>
            </div>

            {/* Skip all */}
            <div className="text-center mt-8">
              <button
                onClick={onSkip}
                className="text-xs uppercase tracking-widest text-text-muted border border-white/20 px-5 py-2 hover:border-white/40 hover:text-text-primary transition-colors"
              >
                Skip — show all events
              </button>
            </div>
          </>
        )}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
        <span className="text-[10px] uppercase tracking-widest text-text-dim">Scroll to browse all</span>
        <div className="w-px h-6 bg-white/20" />
      </div>
    </section>
  );
}
