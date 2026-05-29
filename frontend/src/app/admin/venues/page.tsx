"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AdminVenuesPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await adminFetch<any[]>("/api/admin/venues?limit=50");
      setData(res);
    } catch (e: any) { setError(e.message); }
  }

  async function deleteVenue(id: number) {
    if (!confirm("Delete this venue?")) return;
    try {
      await adminFetch(`/api/admin/venues/${id}`, { method: "DELETE" });
      load();
    } catch {}
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-8">Venues</h1>
      <div className="card-surface p-6">
        <DataTable
          data={data}
          keyField="id"
          columns={[
            { key: "name", label: "Name" },
            { key: "neighbourhood", label: "Neighbourhood" },
            { key: "music_types", label: "Music", render: (r) => (r.music_types || []).join(", ") },
            { key: "is_active", label: "Active", render: (r) => r.is_active ? "Yes" : "No" },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <button onClick={() => deleteVenue(r.id)} className="text-red-400 text-xs hover:text-red-300 transition-colors">
                  Delete
                </button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
