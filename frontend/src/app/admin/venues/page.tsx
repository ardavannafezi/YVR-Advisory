"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";

const ESTABLISHMENT_TYPES = ["Nightclub", "Cocktail Bar", "Bar & Restaurant", "Rooftop Lounge"];
const PRICE_TIERS = ["$", "$$", "$$$"];

const EMPTY_FORM = {
  name: "",
  description: "",
  address: "",
  neighbourhood: "",
  establishment_type: "",
  music_types: "",
  vibe_tags: "",
  price_tier: "",
  image_url: "",
  is_active: true,
  is_featured: false,
};

type FormState = typeof EMPTY_FORM;

function splitCSV(val: string): string[] {
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function AdminVenuesPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [viewEdits, setViewEdits] = useState<Record<number, string>>({});
  const [viewSaving, setViewSaving] = useState<Record<number, boolean>>({});

  async function load() {
    try {
      const res = await adminFetch<any[]>("/api/admin/venues?limit=50");
      setData(res);
      const initial: Record<number, string> = {};
      res.forEach((v: any) => { initial[v.id] = String(v.view_count ?? 0); });
      setViewEdits(initial);
    } catch (e: any) { setError(e.message); }
  }

  async function deleteVenue(id: number) {
    if (!confirm("Delete this venue?")) return;
    try {
      await adminFetch(`/api/admin/venues/${id}`, { method: "DELETE" });
      load();
    } catch {}
  }

  async function createVenue(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await adminFetch("/api/admin/venues", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          music_types: splitCSV(form.music_types),
          vibe_tags: splitCSV(form.vibe_tags),
          price_tier: form.price_tier || null,
          establishment_type: form.establishment_type || null,
          description: form.description || null,
          address: form.address || null,
          neighbourhood: form.neighbourhood || null,
          image_url: form.image_url || null,
        }),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function setViewCount(venueId: number) {
    const val = parseInt(viewEdits[venueId] ?? "0", 10);
    if (isNaN(val) || val < 0) return;
    setViewSaving((s) => ({ ...s, [venueId]: true }));
    try {
      await adminFetch(`/api/admin/venues/${venueId}/views`, {
        method: "PUT",
        body: JSON.stringify({ view_count: val }),
      });
      load();
    } catch {}
    finally { setViewSaving((s) => ({ ...s, [venueId]: false })); }
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-text-primary">Venues</h1>
        <button
          onClick={() => { setShowForm((v) => !v); setFormError(null); }}
          className="text-sm border border-gold/40 text-gold px-4 py-2 hover:bg-gold/10 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Venue"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createVenue} className="card-surface p-6 mb-8 space-y-4">
          <h2 className="font-serif text-xl text-text-primary mb-4">Create Venue</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Neighbourhood</label>
              <input
                value={form.neighbourhood}
                onChange={(e) => setForm((f) => ({ ...f, neighbourhood: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Establishment Type</label>
              <select
                value={form.establishment_type}
                onChange={(e) => setForm((f) => ({ ...f, establishment_type: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
              >
                <option value="">— select —</option>
                {ESTABLISHMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Price Tier</label>
              <select
                value={form.price_tier}
                onChange={(e) => setForm((f) => ({ ...f, price_tier: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
              >
                <option value="">— select —</option>
                {PRICE_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Music Types (comma-separated)</label>
              <input
                value={form.music_types}
                onChange={(e) => setForm((f) => ({ ...f, music_types: e.target.value }))}
                placeholder="hip-hop, house, pop"
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Vibe Tags (comma-separated)</label>
              <input
                value={form.vibe_tags}
                onChange={(e) => setForm((f) => ({ ...f, vibe_tags: e.target.value }))}
                placeholder="luxury, high-energy, bottle service"
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Image URL</label>
              <input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="accent-gold"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                className="accent-gold"
              />
              Featured
            </label>
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-gold text-black text-sm px-6 py-2 font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Venue"}
          </button>
        </form>
      )}

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
              key: "view_count",
              label: "Page Views",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={viewEdits[r.id] ?? String(r.view_count ?? 0)}
                    onChange={(e) => setViewEdits((s) => ({ ...s, [r.id]: e.target.value }))}
                    className="w-20 bg-white/5 border border-white/10 px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-gold/50"
                  />
                  <button
                    onClick={() => setViewCount(r.id)}
                    disabled={viewSaving[r.id]}
                    className="text-[10px] uppercase tracking-widest text-gold hover:text-gold/70 transition-colors disabled:opacity-40"
                  >
                    {viewSaving[r.id] ? "…" : "Set"}
                  </button>
                </div>
              ),
            },
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
