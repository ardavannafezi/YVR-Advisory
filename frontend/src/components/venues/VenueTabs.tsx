"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const TABS = [
  { label: "All", value: "" },
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
    <div className="flex gap-0 border-b border-white/10 overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setCategory(tab.value)}
          className={`shrink-0 px-5 py-3 text-[11px] uppercase tracking-widest transition-colors duration-200 border-b-2 -mb-px ${
            active === tab.value
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
