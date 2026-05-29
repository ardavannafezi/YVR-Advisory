"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AdminReservationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await adminFetch<any[]>("/api/admin/reservations?limit=100");
      setData(res);
    } catch (e: any) { setError(e.message); }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await adminFetch(`/api/admin/reservations/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      load();
    } catch {}
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-text-primary">Reservations</h1>
        <span className="text-text-muted text-sm">{data.length} total</span>
      </div>
      <div className="card-surface p-6">
        <DataTable
          data={data}
          keyField="id"
          columns={[
            { key: "full_name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "party_size", label: "Party" },
            { key: "occasion", label: "Occasion" },
            { key: "budget_range", label: "Budget" },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="bg-background border border-white/10 text-xs text-text-muted px-2 py-1 focus:border-gold focus:outline-none"
                >
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              ),
            },
            { key: "created_at", label: "Date", render: (r) => format(new Date(r.created_at), "MMM d, yyyy") },
          ]}
        />
      </div>
    </div>
  );
}
