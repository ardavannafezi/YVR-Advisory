"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Event } from "@/types";

const STORAGE_KEY = "yvr_events_quiz";

const STEPS = [
  {
    key: "music_types",
    question: "What music are you into?",
    hint: "Select all that apply",
    options: ["house", "techno", "hip-hop", "r&b", "top 40", "latin", "afrobeats", "dancehall", "reggaeton", "edm", "live"],
    optional: false,
  },
  {
    key: "venue_types",
    question: "What type of venue?",
    hint: "Pick one or more",
    options: ["Nightclub", "Cocktail Bar", "Bar & Restaurant", "Rooftop Lounge"],
    optional: false,
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
    <section className="relative overflow-hidden bg-[#080808] border-b border-white/[0.06]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(201,168,76,0.05),transparent)]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl text-text-primary">Find Your Night</h1>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.25em] text-text-dim border border-white/10 px-2.5 py-1">
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <button
            onClick={onSkip}
            className="text-[10px] uppercase tracking-[0.2em] text-text-dim hover:text-gold transition-colors flex items-center gap-1.5"
          >
            Skip ↓
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-px bg-white/[0.07] w-full overflow-hidden mb-7">
          <motion.div
            className="h-full bg-gold"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {hasPrefs ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-dim mb-3">Your preferences</p>
              <div className="flex flex-wrap gap-2">
                {[...answers.venue_types, ...answers.music_types].map(tag => (
                  <span key={tag} className="text-[11px] px-3 py-1.5 border border-gold/40 text-gold uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={usePrefs}
                disabled={loading}
                className="bg-gold text-[#080808] text-[11px] uppercase tracking-[0.2em] px-8 py-3 font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {loading ? "Finding events…" : "Use These Preferences"}
              </button>
              <button
                onClick={resetPrefs}
                className="text-[11px] uppercase tracking-[0.2em] text-text-muted border border-white/15 px-6 py-3 hover:border-white/30 hover:text-text-primary transition-colors"
              >
                Retake
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">
                    {currentStep.question}
                    {currentStep.optional && <span className="ml-2 text-text-dim normal-case tracking-normal">· optional</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
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
                          className={`px-4 py-2 text-xs border transition-all duration-150 capitalize ${
                            active
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-white/10 text-text-muted hover:border-white/25 hover:text-text-primary"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-1">
              {step > 0 ? (
                <button onClick={back} className="text-[10px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors">
                  ← Back
                </button>
              ) : <div />}
              <div className="flex items-center gap-4">
                {currentStep.optional && (
                  <button onClick={advance} disabled={loading} className="text-[10px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors">
                    Skip →
                  </button>
                )}
                <button
                  onClick={advance}
                  disabled={loading || (!canAdvance() && !currentStep.optional)}
                  className="bg-gold text-[#080808] text-[10px] uppercase tracking-[0.2em] px-7 py-3 font-semibold hover:bg-gold-light transition-colors disabled:opacity-35"
                >
                  {loading ? "Searching…" : step < STEPS.length - 1 ? "Next →" : "Find Events"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
