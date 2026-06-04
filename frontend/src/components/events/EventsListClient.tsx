"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { EventCard } from "@/components/events/EventCard";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import type { Event, PaginatedList } from "@/types";

const MUSIC_OPTIONS = ["hip-hop", "house", "techno", "latin", "r&b", "edm", "pop", "live"];
const DATE_OPTIONS = [
  { label: "Tonight", value: "tonight" },
  { label: "This Weekend", value: "weekend" },
  { label: "This Week", value: "week" },
];

function buildDateParams(dateFilter: string | null): { date_from?: string; date_to?: string } {
  if (!dateFilter) return {};
  const now = new Date();
  const toISO = (d: Date) => d.toISOString();

  if (dateFilter === "tonight") {
    const from = new Date(now); from.setHours(0, 0, 0, 0);
    const to = new Date(now); to.setHours(23, 59, 59, 999);
    return { date_from: toISO(from), date_to: toISO(to) };
  }
  if (dateFilter === "weekend") {
    const daysUntilFri = (5 - now.getDay() + 7) % 7 || 7;
    const fri = new Date(now); fri.setDate(now.getDate() + (daysUntilFri === 7 ? 0 : daysUntilFri));
    fri.setHours(0, 0, 0, 0);
    const sun = new Date(fri); sun.setDate(fri.getDate() + 2); sun.setHours(23, 59, 59, 999);
    return { date_from: toISO(fri), date_to: toISO(sun) };
  }
  if (dateFilter === "week") {
    const from = new Date(now); from.setHours(0, 0, 0, 0);
    const to = new Date(now); to.setDate(now.getDate() + 7); to.setHours(23, 59, 59, 999);
    return { date_from: toISO(from), date_to: toISO(to) };
  }
  return {};
}

interface Props {
  initialData: PaginatedList<Event>;
  recommendedResults?: Event[];
  recommendedSimilar?: Event[];
  showRecommended?: boolean;
  onRetakeQuiz?: () => void;
}

export function EventsListClient({ initialData, recommendedResults, recommendedSimilar, showRecommended, onRetakeQuiz }: Props) {
  const [items, setItems] = useState<Event[]>(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [musicFilter, setMusicFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const prevFilters = useRef({ musicFilter, dateFilter });

  const fetchEvents = useCallback(async (pg: number, reset = false) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const dateParams = buildDateParams(dateFilter);
      const qs = new URLSearchParams({
        page: String(pg),
        limit: "12",
        ...(musicFilter ? { music_type: musicFilter } : {}),
        ...(dateParams.date_from ? { date_from: dateParams.date_from } : {}),
        ...(dateParams.date_to ? { date_to: dateParams.date_to } : {}),
      });
      const data = await api.get<PaginatedList<Event>>(`/api/events?${qs}`, { cache: "no-store" });
      if (reset) setItems(data.items); else setItems(prev => [...prev, ...data.items]);
      setTotal(data.total);
      setPage(pg);
    } catch {}
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [musicFilter, dateFilter]);

  useEffect(() => {
    const prev = prevFilters.current;
    if (prev.musicFilter !== musicFilter || prev.dateFilter !== dateFilter) {
      prevFilters.current = { musicFilter, dateFilter };
      fetchEvents(1, true);
    }
  }, [musicFilter, dateFilter, fetchEvents]);

  const hasMore = items.length < total;
  const anyFilter = musicFilter || dateFilter;

  function clearAll() { setMusicFilter(null); setDateFilter(null); }

  const displayItems = showRecommended && recommendedResults?.length ? recommendedResults : items;
  const hasSimilar = showRecommended && recommendedSimilar?.length;

  return (
    <div>
      {/* Filter panel */}
      <div className="mb-10 border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3 overflow-hidden">
        {/* When row */}
        <div className="flex items-start gap-3">
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold w-16 flex-shrink-0 pt-1.5">When</span>
          <div className="flex flex-wrap gap-1.5">
            {DATE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateFilter(f => f === opt.value ? null : opt.value)}
                className={`text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 border transition-all duration-200 ${
                  dateFilter === opt.value
                    ? "border-gold bg-gold/12 text-gold"
                    : "border-white/10 text-text-muted hover:border-white/25 hover:text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* Music + clear row */}
        <div className="flex items-start gap-3">
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold w-16 flex-shrink-0 pt-1.5">Music</span>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {MUSIC_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setMusicFilter(f => f === opt ? null : opt)}
                className={`text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 border transition-all duration-200 ${
                  musicFilter === opt
                    ? "border-gold bg-gold/12 text-gold"
                    : "border-white/10 text-text-muted hover:border-white/25 hover:text-text-primary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {anyFilter && (
            <button
              onClick={clearAll}
              className="flex-shrink-0 text-[10px] uppercase tracking-[0.15em] text-text-dim border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-text-muted transition-colors"
            >
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div className="mb-6 flex items-center justify-between">
        {showRecommended && recommendedResults?.length ? (
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1">Recommended for You</p>
            <p className="text-text-dim text-xs">{recommendedResults.length} events matching your taste</p>
          </div>
        ) : (
          <p className="text-text-dim text-xs">
            {anyFilter ? `${total} matching events` : `${total} upcoming events`}
          </p>
        )}
        {showRecommended && onRetakeQuiz && (
          <button
            onClick={onRetakeQuiz}
            className="sm:hidden text-[10px] uppercase tracking-widest text-text-dim border border-white/10 px-4 py-2 hover:border-gold/30 hover:text-gold transition-colors"
          >
            ← Retake
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : displayItems.length === 0 ? (
        <div className="py-24 text-center border border-white/[0.05]">
          <p className="text-[10px] uppercase tracking-[0.25em] text-text-dim mb-2">No Results</p>
          <p className="text-text-muted text-sm">No events found — try adjusting your filters.</p>
          {anyFilter && (
            <button onClick={clearAll} className="mt-4 text-[11px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          key={`${musicFilter}-${dateFilter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayItems.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </motion.div>
      )}

      {/* You might also like */}
      {hasSimilar && (
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/[0.05]" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-text-dim">You Might Also Like</p>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedSimilar!.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Load more — only when not in recommended mode */}
      {!showRecommended && hasMore && (
        <div className="text-center mt-12">
          <button
            onClick={() => fetchEvents(page + 1)}
            disabled={loadingMore}
            className="text-[11px] uppercase tracking-[0.2em] border border-gold/30 text-gold px-10 py-4 hover:bg-gold/8 transition-colors disabled:opacity-40"
          >
            {loadingMore ? "Loading…" : `Load More — ${total - items.length} remaining`}
          </button>
        </div>
      )}

      {/* Browse all — when in recommended mode */}
      {showRecommended && (
        <div className="text-center mt-12">
          <button
            onClick={clearAll}
            className="text-[11px] uppercase tracking-[0.2em] text-text-dim border border-white/10 px-8 py-4 hover:border-gold/30 hover:text-gold transition-all duration-200"
          >
            Browse All Events
          </button>
        </div>
      )}

      {/* SEO content */}
      <section className="mt-24 pt-10 border-t border-white/[0.05]">
        <h2 className="font-serif text-xl text-text-primary mb-3">Vancouver Nightlife Events</h2>
        <p className="text-text-muted text-sm leading-relaxed max-w-3xl mb-4">
          YVR Advisory curates the best upcoming events across Vancouver — from underground techno nights in Gastown to latin nights on Granville Street, hip-hop events in Yaletown, and live music at Coal Harbour rooftops. Updated weekly with the latest club nights, DJ sets, residencies, and themed events.
        </p>
        <p className="text-text-muted text-sm leading-relaxed max-w-3xl">
          Use our filters to find tonight&apos;s events, this weekend&apos;s events, or browse by music genre. Join a guestlist, book a table, or grab tickets — all in one place. Vancouver&apos;s nightlife, curated.
        </p>
      </section>
    </div>
  );
}
