"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AdminGuestlistPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await adminFetch<any[]>("/api/admin/guestlist?limit=100");
      setData(res);
    } catch (e: any) { setError(e.message); }
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-text-primary">Guestlist</h1>
        <span className="text-text-muted text-sm">{data.length} entries</span>
      </div>
      <div className="card-surface p-6">
        <DataTable
          data={data}
          keyField="id"
          columns={[
            { key: "full_name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "music_type", label: "Music" },
            { key: "party_size", label: "Party" },
            { key: "created_at", label: "Date", render: (r) => format(new Date(r.created_at), "MMM d, yyyy") },
          ]}
        />
      </div>
    </div>
  );
}
