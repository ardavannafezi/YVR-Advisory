"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth";
import { StatCard } from "@/components/admin/StatCard";
import { ErrorState } from "@/components/ui/ErrorState";
import type { AnalyticsSummary } from "@/types";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await adminFetch<AnalyticsSummary>("/api/admin/analytics/summary");
      setData(res);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <p className="text-text-muted animate-pulse">Loading...</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-8">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Guestlist" value={data.total_guestlist} />
        <StatCard label="Total Reservations" value={data.total_reservations} />
        <StatCard label="Pending Reservations" value={data.pending_reservations} />
        <StatCard label="Venues Tracked" value={data.top_venues.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-surface p-6">
          <p className="text-xs uppercase tracking-widest text-gold mb-4">Top Venues by Guestlist</p>
          {data.top_venues.map((v) => (
            <div key={v.name} className="flex justify-between py-2 border-b border-white/5 text-sm">
              <span className="text-text-muted">{v.name}</span>
              <span className="text-text-primary">{v.count}</span>
            </div>
          ))}
          {!data.top_venues.length && <p className="text-text-dim">No data yet</p>}
        </div>

        <div className="card-surface p-6">
          <p className="text-xs uppercase tracking-widest text-gold mb-4">Music Type Distribution</p>
          {data.music_type_distribution?.map((m: any) => (
            <div key={m.genre} className="flex justify-between py-2 border-b border-white/5 text-sm">
              <span className="text-text-muted capitalize">{m.genre}</span>
              <span className="text-text-primary">{m.count}</span>
            </div>
          ))}
          {!data.music_type_distribution?.length && <p className="text-text-dim">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
