"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { EventCard } from "@/components/events/EventCard";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import type { Event, PaginatedList } from "@/types";

const MUSIC_OPTIONS = ["hip-hop", "house", "techno", "latin", "r&b", "edm", "pop", "live"];
const ENTRY_OPTIONS = [
  { value: "guestlist", label: "Guestlist" },
  { value: "tickets", label: "Tickets" },
  { value: "reservation", label: "Reservation" },
];
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
}

export function EventsListClient({ initialData, recommendedResults, recommendedSimilar, showRecommended }: Props) {
  const [items, setItems] = useState<Event[]>(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [musicFilter, setMusicFilter] = useState<string | null>(null);
  const [entryFilter, setEntryFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const prevFilters = useRef({ musicFilter, entryFilter, dateFilter });

  const fetchEvents = useCallback(async (pg: number, reset = false) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const dateParams = buildDateParams(dateFilter);
      const qs = new URLSearchParams({
        page: String(pg),
        limit: "12",
        ...(musicFilter ? { music_type: musicFilter } : {}),
        ...(entryFilter ? { entry_type: entryFilter } : {}),
        ...(dateParams.date_from ? { date_from: dateParams.date_from } : {}),
        ...(dateParams.date_to ? { date_to: dateParams.date_to } : {}),
      });
      const data = await api.get<PaginatedList<Event>>(`/api/events?${qs}`, { cache: "no-store" });
      if (reset) {
        setItems(data.items);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }
      setTotal(data.total);
      setPage(pg);
    } catch {}
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [musicFilter, entryFilter, dateFilter]);

  // Refetch when filters change
  useEffect(() => {
    const prev = prevFilters.current;
    if (prev.musicFilter !== musicFilter || prev.entryFilter !== entryFilter || prev.dateFilter !== dateFilter) {
      prevFilters.current = { musicFilter, entryFilter, dateFilter };
      fetchEvents(1, true);
    }
  }, [musicFilter, entryFilter, dateFilter, fetchEvents]);

  const hasMore = items.length < total;

  function toggleMusic(val: string) { setMusicFilter(f => f === val ? null : val); }
  function toggleEntry(val: string) { setEntryFilter(f => f === val ? null : val); }
  function toggleDate(val: string) { setDateFilter(f => f === val ? null : val); }

  const displayItems = showRecommended && recommendedResults?.length ? recommendedResults : items;
  const hasSimilar = showRecommended && recommendedSimilar?.length;

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] uppercase tracking-widest text-text-dim mr-1">Music</span>
          {MUSIC_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => toggleMusic(opt)}
              className={`text-[11px] px-3 py-1.5 border transition-all duration-200 ${
                musicFilter === opt
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 text-text-muted hover:border-white/25"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] uppercase tracking-widest text-text-dim mr-1">Entry</span>
          {ENTRY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleEntry(opt.value)}
              className={`text-[11px] px-3 py-1.5 border transition-all duration-200 ${
                entryFilter === opt.value
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 text-text-muted hover:border-white/25"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <span className="text-[10px] uppercase tracking-widest text-text-dim ml-3 mr-1">When</span>
          {DATE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleDate(opt.value)}
              className={`text-[11px] px-3 py-1.5 border transition-all duration-200 ${
                dateFilter === opt.value
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 text-text-muted hover:border-white/25"
              }`}
            >
              {opt.label}
            </button>
          ))}

          {(musicFilter || entryFilter || dateFilter) && (
            <button
              onClick={() => { setMusicFilter(null); setEntryFilter(null); setDateFilter(null); }}
              className="text-[11px] text-text-dim hover:text-text-muted ml-2 underline-offset-2 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      {showRecommended && recommendedResults?.length ? (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Recommended for You</p>
          <p className="text-text-dim text-xs">{recommendedResults.length} events matching your taste</p>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-text-dim text-xs">{total} upcoming events</p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : displayItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-text-muted text-sm">No events found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}

      {/* You might also like */}
      {hasSimilar && (
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <p className="text-[10px] uppercase tracking-widest text-text-dim">You Might Also Like</p>
            <div className="flex-1 h-px bg-white/5" />
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
        <div className="text-center mt-10">
          <button
            onClick={() => fetchEvents(page + 1)}
            disabled={loadingMore}
            className="text-sm border border-gold/30 text-gold px-8 py-3 hover:bg-gold/10 transition-colors disabled:opacity-40"
          >
            {loadingMore ? "Loading…" : `Load More (${total - items.length} remaining)`}
          </button>
        </div>
      )}

      {/* Show all events button when in recommended mode */}
      {showRecommended && (
        <div className="text-center mt-10">
          <button
            onClick={() => {
              setMusicFilter(null);
              setEntryFilter(null);
              setDateFilter(null);
            }}
            className="text-[11px] uppercase tracking-widest text-text-dim border border-white/10 px-6 py-3 hover:border-white/25 transition-colors"
          >
            Show All Events
          </button>
        </div>
      )}
    </div>
  );
}
