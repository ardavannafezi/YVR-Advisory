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
      {/* Quiz — slides out when done */}
      <AnimatePresence>
        {!quizDone && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <EventsQuiz onResults={handleResults} onSkip={handleSkip} listRef={listRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* All events section */}
      <section
        ref={listRef as React.RefObject<HTMLElement>}
        className="max-w-7xl mx-auto px-6 pb-28 pt-16"
      >
        {quizDone ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-10 flex items-end justify-between"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">Questionnaire Results</p>
              <h2 className="font-serif text-3xl md:text-4xl text-text-primary">Recommended Events</h2>
            </div>
            <button
              onClick={() => setQuizDone(false)}
              className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-widest text-text-dim border border-white/10 px-5 py-2.5 hover:border-gold/30 hover:text-gold transition-all duration-200"
            >
              ← Retake Questionnaire
            </button>
          </motion.div>
        ) : (
          <div className="mb-12">
            <div className="flex items-center gap-4">
              <div className="w-6 h-px bg-gold" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">All Events</p>
            </div>
          </div>
        )}

        <EventsListClient
          initialData={initialData}
          recommendedResults={recommendedResults}
          recommendedSimilar={recommendedSimilar}
          showRecommended={quizDone}
          onRetakeQuiz={() => setQuizDone(false)}
        />
      </section>
    </>
  );
}
