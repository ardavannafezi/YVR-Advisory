"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import { GoldButton } from "@/components/ui/GoldButton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { slideInRight, goldDivider } from "@/styles/animations";
import { usePreferenceTracker } from "@/hooks/usePreferenceTracker";
import { UpcomingEventsStrip } from "@/components/tonight/UpcomingEventsStrip";
import type { Recommendation } from "@/types";

const STEPS = [
  {
    key: "music_type",
    question: "What's your sound tonight?",
    options: ["techno", "house", "hip-hop", "latin", "r&b", "edm", "pop", "live"],
  },
  {
    key: "vibe",
    question: "Choose your vibe",
    options: ["upscale", "underground", "dance floor", "lounge", "bottle service", "casual"],
  },
  {
    key: "party_size",
    question: "How many in your group?",
    options: ["1–2", "3–5", "6–10", "10+"],
  },
  {
    key: "budget",
    question: "What's your budget per person?",
    options: ["Under $30", "$30–$60", "$60–$100", "$100+"],
  },
];

export function TonightPageClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackQuizStep } = usePreferenceTracker();

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  async function selectOption(value: string) {
    const next = { ...answers, [currentStep.key]: value };
    setAnswers(next);
    trackQuizStep({ step: currentStep.key, value });

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await submit(next);
    }
  }

  async function submit(data: Record<string, string>) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ recommendations: Recommendation[] }>("/api/tonight/recommend", {
        music_type: data.music_type,
        vibe: data.vibe,
        party_size: data.party_size,
        budget: data.budget,
      });
      setResults(res.recommendations);
    } catch {
      setError("Could not fetch recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setResults(null);
    setError(null);
  }

  if (results) {
    return (
      <>
        <div className="pt-32 pb-24 max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">Your Advisor Says</p>
            <h1 className="font-serif text-4xl md:text-5xl text-text-primary mb-2">Tonight&apos;s Picks</h1>
            <motion.div variants={goldDivider} initial="hidden" animate="visible" className="h-px w-16 bg-gold mb-10 origin-left" />

            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted mb-6">No matching venues tonight. Try adjusting your preferences.</p>
                <GoldButton onClick={reset}>Try Again</GoldButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {results.map((r) => (
                  <Link key={r.venue.id} href={`/venues/${r.venue.slug}`} className="group card-surface p-6 hover:border-gold/40 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-serif text-xl text-text-primary group-hover:text-gold transition-colors">{r.venue.name}</h3>
                      {r.has_event_tonight && <Badge label="Event Tonight" variant="gold" />}
                    </div>
                    {r.venue.neighbourhood && <p className="text-text-dim text-xs uppercase tracking-widest mb-2">{r.venue.neighbourhood}</p>}
                    {r.venue.description && <p className="text-text-muted text-sm line-clamp-2 leading-relaxed mb-3">{r.venue.description}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {r.venue.music_types.slice(0, 2).map((t) => <Badge key={t} label={t} variant="gold" />)}
                      {r.venue.vibe_tags.slice(0, 2).map((t) => <Badge key={t} label={t} />)}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <GoldButton onClick={reset} variant="outline">Start Over</GoldButton>
              <Link href="/venues"><GoldButton variant="ghost">Browse All Venues</GoldButton></Link>
            </div>
          </motion.div>
        </div>
        <UpcomingEventsStrip />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between text-text-dim text-[10px] uppercase tracking-widest mb-2">
              <span>Question {step + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-px bg-white/10 relative">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gold"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-10 text-center">
                {currentStep.question}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => selectOption(opt)}
                    className="group card-surface p-5 text-left hover:border-gold/60 hover:bg-gold/5 transition-all duration-200"
                  >
                    <span className="text-text-muted group-hover:text-text-primary capitalize transition-colors">{opt}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {loading && (
            <div className="mt-10 text-center">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gold text-xs uppercase tracking-widest">
                Finding your perfect night...
              </motion.div>
            </div>
          )}

          {error && <div className="mt-8"><ErrorState message={error} onRetry={() => submit(answers)} /></div>}

          {step > 0 && !loading && (
            <button onClick={() => setStep(step - 1)} className="mt-8 text-text-dim text-xs uppercase tracking-widest hover:text-text-muted transition-colors">
              ← Back
            </button>
          )}
        </div>
      </div>
      <UpcomingEventsStrip />
    </>
  );
}
