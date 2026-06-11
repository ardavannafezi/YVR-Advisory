"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";

interface Lead {
  id: number;
  name: string;
  email: string;
  source_type: string;
  venue_name: string | null;
  venue_type: string | null;
  music_type: string | null;
  event_name: string | null;
  redirect_url: string | null;
  created_at: string;
}

const SOURCE_LABELS: Record<string, string> = {
  ticket: "Tickets",
  external_guestlist: "External Guestlist",
  external_reservation: "Book Directly",
};

export default function AdminLeadsPage() {
  const [data, setData] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(search: string, source: string) {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (search) params.set("q", search);
      if (source) params.set("source_type", source);
      const res = await adminFetch<Lead[]>(`/api/admin/leads?${params}`);
      setData(res);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => { load("", ""); }, []);

  function handleSearch(val: string) {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(val, sourceFilter), 300);
  }

  function handleSource(val: string) {
    setSourceFilter(val);
    load(q, val);
  }

  if (error) return <ErrorState message={error} onRetry={() => load(q, sourceFilter)} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-text-primary">Leads</h1>
        <span className="text-text-muted text-sm">{data.length} captured</span>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search name, email, venue, event..."
          className="flex-1 min-w-[220px] bg-transparent border border-white/10 px-4 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-gold/50"
        />
        <select
          value={sourceFilter}
          onChange={(e) => handleSource(e.target.value)}
          className="bg-transparent border border-white/10 px-4 py-2 text-sm text-text-muted focus:outline-none focus:border-gold/50"
        >
          <option value="">All sources</option>
          <option value="ticket">Tickets</option>
          <option value="external_guestlist">External Guestlist</option>
          <option value="external_reservation">Book Directly</option>
        </select>
      </div>

      <div className="card-surface p-6">
        <DataTable
          data={data}
          keyField="id"
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "source_type", label: "Source", render: (r) => SOURCE_LABELS[r.source_type] ?? r.source_type },
            { key: "event_name", label: "Event" },
            { key: "venue_name", label: "Venue" },
            { key: "venue_type", label: "Venue Type" },
            { key: "music_type", label: "Music" },
            { key: "created_at", label: "Date", render: (r) => format(new Date(r.created_at), "MMM d, yyyy") },
          ]}
        />
      </div>
    </div>
  );
}
