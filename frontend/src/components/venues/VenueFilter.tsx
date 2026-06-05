"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { usePreferenceTracker } from "@/hooks/usePreferenceTracker";

const MUSIC_TYPES = ["house", "techno", "hip-hop", "r&b", "top 40", "latin", "afrobeats", "dancehall", "reggaeton", "edm", "live"];
const NEIGHBOURHOODS = [
  "Granville Strip", "Gastown", "Yaletown", "Coal Harbour",
  "Davie Village", "Mount Pleasant", "East Vancouver", "False Creek",
];
const PRIMARY_NIGHTS = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const PRICE_TIERS = ["$", "$$", "$$$"];

const SUB_FILTER_KEYS = ["music_type", "neighbourhood", "primary_night", "price_tier"];

export function VenueFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const { trackFilter } = usePreferenceTracker();
  const [open, setOpen] = useState(false);

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
  const activeCount = SUB_FILTER_KEYS.filter((k) => params.get(k)).length;

  const clearFilters = useCallback(() => {
    const p = new URLSearchParams();
    const cat = params.get("primary_category");
    if (cat) p.set("primary_category", cat);
    router.push(`/venues?${p.toString()}`);
    setOpen(false);
  }, [params, router]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-widest px-4 py-2.5 border transition-colors ${
            open || activeCount > 0
              ? "border-gold bg-gold/5 text-gold"
              : "border-white/10 text-text-muted hover:border-gold/40"
          }`}
        >
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="bg-gold text-background text-[9px] font-bold px-1.5 py-0.5 leading-none">
              {activeCount}
            </span>
          )}
          <span className="text-[9px] ml-1">{open ? "▲" : "▼"}</span>
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-[10px] uppercase tracking-widest text-text-dim hover:text-gold transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 p-5 border border-white/10 bg-white/[0.02] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gold mb-3">Music</p>
            <div className="flex flex-wrap gap-1.5">
              {MUSIC_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter("music_type", t)}
                  className={`text-[10px] uppercase tracking-widest px-2 py-1 border transition-colors ${
                    active("music_type", t)
                      ? "border-gold text-gold bg-gold/10"
                      : "border-white/10 text-text-muted hover:border-gold/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gold mb-3">Neighbourhood</p>
            <div className="flex flex-col gap-2">
              {NEIGHBOURHOODS.map((n) => (
                <button
                  key={n}
                  onClick={() => setFilter("neighbourhood", n)}
                  className={`text-left text-[11px] transition-colors ${
                    active("neighbourhood", n) ? "text-gold" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gold mb-3">Best Night</p>
            <div className="flex flex-col gap-2">
              {PRIMARY_NIGHTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setFilter("primary_night", n.toLowerCase())}
                  className={`text-left text-[11px] transition-colors ${
                    active("primary_night", n.toLowerCase()) ? "text-gold" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gold mb-3">Price</p>
            <div className="flex gap-2 flex-wrap">
              {PRICE_TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter("price_tier", t)}
                  className={`text-sm px-3 py-1.5 border transition-colors ${
                    active("price_tier", t)
                      ? "border-gold text-gold bg-gold/10"
                      : "border-white/10 text-text-muted hover:border-gold/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
