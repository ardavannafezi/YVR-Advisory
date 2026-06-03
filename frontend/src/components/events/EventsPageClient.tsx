"use client";

import { useRef } from "react";
import { EventsListClient } from "@/components/events/EventsListClient";
import type { Event, PaginatedList } from "@/types";

interface Props {
  initialData: PaginatedList<Event>;
  initialMusicFilter?: string | null;
  initialDateFilter?: string | null;
  initialEntryFilter?: string | null;
}

export function EventsPageClient({ initialData, initialMusicFilter, initialDateFilter, initialEntryFilter }: Props) {
  const listRef = useRef<HTMLElement>(null);

  return (
    <section ref={listRef as React.RefObject<HTMLElement>} className="max-w-7xl mx-auto px-6 pb-28 pt-28">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-1">
          <div className="w-6 h-px bg-gold" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Upcoming Events</p>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-text-primary mt-3">Vancouver Events</h1>
      </div>
      <EventsListClient
        initialData={initialData}
        initialMusicFilter={initialMusicFilter ?? null}
        initialDateFilter={initialDateFilter ?? null}
        initialEntryFilter={initialEntryFilter ?? null}
      />
    </section>
  );
}
