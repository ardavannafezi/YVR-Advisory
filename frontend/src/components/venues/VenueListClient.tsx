"use client";

import { useState } from "react";
import { VenueCard } from "@/components/venues/VenueCard";
import { GoldButton } from "@/components/ui/GoldButton";
import type { Venue, PaginatedList } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";
const LIMIT = 12;

interface Props {
  initialItems: Venue[];
  total: number;
  searchParams: Record<string, string>;
}

export function VenueListClient({ initialItems, total, searchParams }: Props) {
  const [items, setItems] = useState<Venue[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const hasMore = items.length < total;

  async function loadMore() {
    setLoading(true);
    setError(false);
    const nextPage = Math.floor(items.length / LIMIT) + 1;
    const qs = new URLSearchParams({
      ...searchParams,
      page: String(nextPage),
      limit: String(LIMIT),
    }).toString();
    try {
      const res = await fetch(`${BASE_URL}/api/venues?${qs}`);
      if (!res.ok) throw new Error();
      const data: PaginatedList<Venue> = await res.json();
      setItems((prev) => [...prev, ...data.items]);
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  if (items.length === 0) {
    return (
      <p className="text-text-muted py-16 text-center text-sm uppercase tracking-widest">
        No venues match your filters.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((v, i) => (
          <VenueCard key={v.id} venue={v} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <GoldButton variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading…" : `Load More · ${total - items.length} remaining`}
          </GoldButton>
          {error && (
            <p className="text-[10px] uppercase tracking-widest text-text-dim">
              Failed to load — try again
            </p>
          )}
        </div>
      )}
    </div>
  );
}
