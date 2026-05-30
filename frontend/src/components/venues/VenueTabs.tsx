"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const TABS = [
  { label: "All Venues", value: "" },
  { label: "Nightclubs", value: "nightclub" },
  { label: "Lounges", value: "lounge" },
  { label: "Bars", value: "bar" },
  { label: "Live Music", value: "live_music" },
];

export function VenueTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("primary_category") ?? "";

  const setCategory = useCallback(
    (value: string) => {
      const p = new URLSearchParams(params.toString());
      if (value) {
        p.set("primary_category", value);
      } else {
        p.delete("primary_category");
      }
      router.push(`/venues?${p.toString()}`);
    },
    [params, router]
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setCategory(tab.value)}
          className={`shrink-0 px-5 py-2.5 text-[11px] uppercase tracking-widest transition-colors duration-200 ${
            active === tab.value
              ? "border border-gold bg-gold/10 text-gold"
              : "border border-white/10 text-text-muted hover:border-gold/40 hover:text-text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
