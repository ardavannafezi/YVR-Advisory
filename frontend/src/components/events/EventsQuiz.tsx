"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Event } from "@/types";

const STORAGE_KEY = "yvr_events_quiz";

const STEPS = [
  {
    key: "venue_types",
    question: "What type of venue?",
    hint: "Select one or more",
    options: ["Nightclub", "Cocktail Bar", "Bar & Restaurant", "Rooftop Lounge"],
    optional: false,
  },
  {
    key: "music_types",
    question: "What music moves you?",
    hint: "Select all that apply",
    options: ["hip-hop", "house", "techno", "latin", "r&b", "edm", "pop", "live"],
    optional: false,
  },
  {
    key: "date",
    question: "When are you going out?",
    hint: "Optional — skip to see all dates",
    options: ["Tonight", "This Weekend", "This Week"],
    optional: true,
  },
];

const DATE_MAP: Record<string, string> = {
  Tonight: "tonight",
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

  function toggleMulti(key: "venue_types" | "music_types", val: string) {
    setAnswers(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  }

  function toggleDate(val: string) {
    setAnswers(prev => ({ ...prev, date: prev.date === DATE_MAP[val] ? null : DATE_MAP[val] }));
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
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.22 } }),
  };

  return (
    <section className="relative min-h-[88vh] flex flex-col overflow-hidden bg-[#080808]">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,168,76,0.07),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080808] to-transparent" />
      </div>

      {/* Top bar — questionnaire label + skip */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-8 pb-0">
        <div className="flex items-center gap-3">
          <div className="w-5 h-px bg-gold" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Event Questionnaire</span>
        </div>
        <button
          onClick={onSkip}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-text-dim border border-white/15 px-5 py-2.5 hover:border-gold/40 hover:text-gold transition-all duration-200"
        >
          Skip — Browse All Events
          <span className="text-gold/60">↓</span>
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Page heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-14"
          >
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-text-primary mb-4">
              Find Your Night
            </h1>
            <p className="text-text-muted text-sm max-w-sm mx-auto leading-relaxed">
              Answer {STEPS.length} quick questions and we&apos;ll surface the events that match your taste.
            </p>
          </motion.div>

          {hasPrefs ? (
            /* Returning user */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-dim mb-4">Your saved preferences</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[...answers.venue_types, ...answers.music_types].map(tag => (
                    <span key={tag} className="text-[11px] px-4 py-2 border border-gold/40 text-gold uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={usePrefs}
                  disabled={loading}
                  className="bg-gold text-[#080808] text-[11px] uppercase tracking-[0.2em] px-10 py-4 font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  {loading ? "Finding events…" : "Use These Preferences"}
                </button>
                <button
                  onClick={resetPrefs}
                  className="text-[11px] uppercase tracking-[0.2em] text-text-muted border border-white/15 px-8 py-4 hover:border-white/30 hover:text-text-primary transition-colors"
                >
                  Retake Questionnaire
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Step dots */}
              <div className="flex items-center justify-center gap-3 mb-10">
                {STEPS.map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        backgroundColor: i < step ? "#c9a84c" : i === step ? "transparent" : "transparent",
                        borderColor: i <= step ? "#c9a84c" : "rgba(255,255,255,0.15)",
                        scale: i === step ? 1.15 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-6 h-6 rounded-full border flex items-center justify-center"
                    >
                      {i < step ? (
                        <span className="text-[9px] text-[#080808] font-bold">✓</span>
                      ) : (
                        <span className={`text-[10px] font-semibold ${i === step ? "text-gold" : "text-white/20"}`}>
                          {i + 1}
                        </span>
                      )}
                    </motion.div>
                    {i < STEPS.length - 1 && (
                      <motion.div
                        animate={{ backgroundColor: i < step ? "#c9a84c" : "rgba(255,255,255,0.08)" }}
                        transition={{ duration: 0.3 }}
                        className="w-12 h-px"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="h-px bg-white/8 w-full overflow-hidden mb-10">
                <motion.div
                  className="h-full bg-gold"
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
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
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-3">
                      Step {step + 1} of {STEPS.length}
                      {currentStep.optional && (
                        <span className="ml-2 text-text-dim normal-case tracking-normal">· optional</span>
                      )}
                    </p>
                    <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">
                      {currentStep.question}
                    </h2>
                    <p className="text-text-dim text-sm">{currentStep.hint}</p>
                  </div>

                  {/* Options */}
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
                          className={`px-6 py-3 text-sm border transition-all duration-200 capitalize ${
                            active
                              ? "border-gold bg-gold/12 text-gold font-medium"
                              : "border-white/12 text-text-muted hover:border-white/30 hover:text-text-primary hover:bg-white/[0.03]"
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
              <div className="flex items-center justify-between mt-12">
                <div>
                  {step > 0 ? (
                    <button
                      onClick={back}
                      className="text-[11px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors flex items-center gap-2"
                    >
                      ← Back
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={advance}
                    disabled={loading || (!canAdvance() && !currentStep.optional)}
                    className="bg-gold text-[#080808] text-[11px] uppercase tracking-[0.2em] px-10 py-4 font-semibold hover:bg-gold-light transition-colors disabled:opacity-35"
                  >
                    {loading
                      ? "Finding events…"
                      : step < STEPS.length - 1
                      ? "Continue →"
                      : "Find My Events"}
                  </button>
                  {currentStep.optional && (
                    <button
                      onClick={advance}
                      disabled={loading}
                      className="text-[10px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors"
                    >
                      Skip this step →
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom fade hint */}
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-2 opacity-40">
          <span className="text-[9px] uppercase tracking-[0.35em] text-text-dim">or scroll to browse</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-px h-6 bg-gradient-to-b from-gold/30 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
