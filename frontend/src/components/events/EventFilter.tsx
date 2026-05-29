"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const MUSIC_TYPES = ["techno", "house", "hip-hop", "latin", "r&b", "pop", "edm", "live"];
const CATEGORIES = ["rave", "latin night", "hip-hop night", "themed", "residency", "open format"];

export function EventFilter() {
  const router = useRouter();
  const params = useSearchParams();

  const setFilter = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(params.toString());
      p.get(key) === value ? p.delete(key) : p.set(key, value);
      router.push(`/events?${p.toString()}`);
    },
    [params, router]
  );

  const active = (key: string, value: string) => params.get(key) === value;

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="card-surface p-6">
        <p className="text-xs uppercase tracking-widest text-gold mb-4">Music Type</p>
        <div className="flex flex-wrap gap-2 mb-6">
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
        <p className="text-xs uppercase tracking-widest text-gold mb-4">Category</p>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter("category", c)}
              className={`text-left text-sm transition-colors ${
                active("category", c) ? "text-gold" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
