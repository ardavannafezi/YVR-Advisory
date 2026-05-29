"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AdminEventsPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await adminFetch<any[]>("/api/admin/events?limit=50");
      setData(res);
    } catch (e: any) { setError(e.message); }
  }

  async function deleteEvent(id: number) {
    if (!confirm("Delete this event?")) return;
    try {
      await adminFetch(`/api/admin/events/${id}`, { method: "DELETE" });
      load();
    } catch {}
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-8">Events</h1>
      <div className="card-surface p-6">
        <DataTable
          data={data}
          keyField="id"
          columns={[
            { key: "name", label: "Event" },
            { key: "venue", label: "Venue", render: (r) => r.venue?.name || "—" },
            { key: "date", label: "Date", render: (r) => format(new Date(r.date), "MMM d, yyyy h:mm a") },
            { key: "music_type", label: "Music" },
            { key: "source", label: "Source" },
            { key: "is_published", label: "Published", render: (r) => r.is_published ? "Yes" : "No" },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <button onClick={() => deleteEvent(r.id)} className="text-red-400 text-xs hover:text-red-300 transition-colors">
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
