"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { usePreferenceTracker } from "@/hooks/usePreferenceTracker";

const ESTABLISHMENT_TYPES = ["Nightclub", "Cocktail Bar", "Bar & Restaurant", "Rooftop Lounge"];
const MUSIC_TYPES = ["techno", "house", "hip-hop", "latin", "r&b", "pop", "edm", "live"];
const NEIGHBOURHOODS = [
  "Granville Strip",
  "Gastown",
  "Yaletown",
  "Coal Harbour",
  "Davie Village",
  "Mount Pleasant",
  "East Vancouver",
  "False Creek",
];
const PRIMARY_NIGHTS = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const PRICE_TIERS = ["$", "$$", "$$$"];

export function VenueFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const { trackFilter } = usePreferenceTracker();

  const setFilter = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(params.toString());
      if (p.get(key) === value) {
        p.delete(key);
      } else {
        p.set(key, value);
      }
      trackFilter({ [key]: value });
      router.push(`/venues?${p.toString()}`);
    },
    [params, router, trackFilter]
  );

  const active = (key: string, value: string) => params.get(key) === value;
  const hasFilters = params.toString().length > 0;

  const clearAll = useCallback(() => {
    router.push("/venues");
  }, [router]);

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="card-surface p-6 flex flex-col gap-6">
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors text-left"
          >
            ✕ Clear filters
          </button>
        )}
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Venue Type</p>
          <div className="flex flex-col gap-2">
            {ESTABLISHMENT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setFilter("establishment_type", t)}
                className={`text-left text-sm transition-colors ${
                  active("establishment_type", t) ? "text-gold" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Music</p>
          <div className="flex flex-wrap gap-2">
            {MUSIC_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setFilter("music_type", t)}
                className={`text-[10px] uppercase tracking-widest px-2.5 py-1 border transition-colors ${
                  active("music_type", t)
                    ? "border-gold text-gold bg-gold/10"
                    : "border-white/10 text-text-muted hover:border-gold/40 hover:text-text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Neighbourhood</p>
          <div className="flex flex-col gap-2">
            {NEIGHBOURHOODS.map((n) => (
              <button
                key={n}
                onClick={() => setFilter("neighbourhood", n)}
                className={`text-left text-sm transition-colors ${
                  active("neighbourhood", n) ? "text-gold" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Best Night</p>
          <div className="flex flex-wrap gap-2">
            {PRIMARY_NIGHTS.map((n) => (
              <button
                key={n}
                onClick={() => setFilter("primary_night", n.toLowerCase())}
                className={`text-[10px] uppercase tracking-widest px-2.5 py-1 border transition-colors ${
                  active("primary_night", n.toLowerCase())
                    ? "border-gold text-gold bg-gold/10"
                    : "border-white/10 text-text-muted hover:border-gold/40 hover:text-text-primary"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Price Range</p>
          <div className="flex gap-2">
            {PRICE_TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter("price_tier", t)}
                className={`text-sm px-3 py-1 border transition-colors ${
                  active("price_tier", t)
                    ? "border-gold text-gold bg-gold/10"
                    : "border-white/10 text-text-muted hover:border-gold/40 hover:text-text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
