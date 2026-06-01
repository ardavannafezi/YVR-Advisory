"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EventsQuiz } from "@/components/events/EventsQuiz";
import { EventsListClient } from "@/components/events/EventsListClient";
import type { Event, PaginatedList } from "@/types";

interface Props {
  initialData: PaginatedList<Event>;
}

export function EventsPageClient({ initialData }: Props) {
  const listRef = useRef<HTMLElement>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [recommendedResults, setRecommendedResults] = useState<Event[]>([]);
  const [recommendedSimilar, setRecommendedSimilar] = useState<Event[]>([]);

  function handleResults(results: Event[], similar: Event[]) {
    setRecommendedResults(results);
    setRecommendedSimilar(similar);
    setQuizDone(true);
  }

  function handleSkip() {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setQuizDone(false);
  }

  return (
    <>
      {/* Quiz section — full height */}
      <AnimatePresence>
        {!quizDone && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <EventsQuiz onResults={handleResults} onSkip={handleSkip} listRef={listRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider visible only when quiz is showing, peeks events below */}
      {!quizDone && (
        <div className="flex items-center gap-4 px-6 max-w-7xl mx-auto -mt-4 mb-4">
          <div className="flex-1 h-px bg-white/5" />
          <p className="text-[10px] uppercase tracking-widest text-text-dim">All Events</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>
      )}

      {/* Events list section */}
      <section
        ref={listRef as React.RefObject<HTMLElement>}
        className="max-w-7xl mx-auto px-6 pb-24 pt-8"
      >
        {quizDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Your Results</p>
              <h2 className="font-serif text-3xl text-text-primary">Recommended Events</h2>
            </div>
            <button
              onClick={() => setQuizDone(false)}
              className="text-[11px] uppercase tracking-widest text-text-dim border border-white/10 px-4 py-2 hover:border-white/25 transition-colors"
            >
              ← Retake Quiz
            </button>
          </motion.div>
        )}

        <EventsListClient
          initialData={initialData}
          recommendedResults={recommendedResults}
          recommendedSimilar={recommendedSimilar}
          showRecommended={quizDone}
        />
      </section>
    </>
  );
}
