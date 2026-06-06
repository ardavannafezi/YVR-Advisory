"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { AdminModal } from "@/components/admin/AdminModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";

const MUSIC_OPTIONS = ["hip-hop", "house", "techno", "latin", "r&b", "edm", "pop", "live", "top-40", "k-pop", "country", "rock"];
const ENTRY_TYPE_OPTIONS = [
  { value: "guestlist", label: "Guestlist" },
  { value: "tickets", label: "Tickets" },
  { value: "reservation", label: "Bottle Service / Reservation" },
];

interface LineupArtist {
  name: string;
  instagram: string;
  tiktok: string;
  youtube: string;
}

interface FormState {
  name: string;
  venue_id: string;
  date: string;
  category: string;
  music_type: string;
  description: string;
  image_url: string;
  ticket_url: string;
  is_published: boolean;
  gallery_urls: string;
  video_url: string;
  entry_types: string[];
  our_guestlist: boolean;
  our_reservation: boolean;
  lineup: LineupArtist[];
}

const EMPTY_FORM: FormState = {
  name: "", venue_id: "", date: "", category: "", music_type: "",
  description: "", image_url: "", ticket_url: "", is_published: true,
  gallery_urls: "", video_url: "",
  entry_types: [], our_guestlist: false, our_reservation: false,
  lineup: [],
};

function buildPayload(form: FormState) {
  return {
    name: form.name,
    venue_id: form.venue_id ? parseInt(form.venue_id) : null,
    date: form.date ? new Date(form.date).toISOString() : null,
    category: form.category || null,
    music_type: form.music_type || null,
    description: form.description || null,
    image_url: form.image_url || null,
    ticket_url: form.ticket_url || null,
    is_published: form.is_published,
    gallery: form.gallery_urls.split("\n").map(s => s.trim()).filter(Boolean),
    video_url: form.video_url || null,
    entry_types: form.entry_types.length ? form.entry_types : null,
    our_guestlist: form.our_guestlist,
    our_reservation: form.our_reservation,
    lineup: form.lineup.filter(a => a.name.trim()).map(a => ({
      name: a.name.trim(),
      instagram: a.instagram || null,
      tiktok: a.tiktok || null,
      youtube: a.youtube || null,
    })),
  };
}

function eventToForm(e: any): FormState {
  return {
    name: e.name || "",
    venue_id: e.venue_id ? String(e.venue_id) : "",
    date: e.date ? new Date(e.date).toISOString().slice(0, 16) : "",
    category: e.category || "",
    music_type: e.music_type || "",
    description: e.description || "",
    image_url: e.image_url || "",
    ticket_url: e.ticket_url || "",
    is_published: e.is_published ?? true,
    gallery_urls: (e.gallery || []).join("\n"),
    video_url: e.video_url || "",
    entry_types: e.entry_types || [],
    our_guestlist: e.our_guestlist ?? false,
    our_reservation: e.our_reservation ?? false,
    lineup: (e.lineup || []).map((a: any) => ({
      name: a.name || "",
      instagram: a.instagram || "",
      tiktok: a.tiktok || "",
      youtube: a.youtube || "",
    })),
  };
}

const inputCls = "w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50";
const sectionCls = "border-t border-white/10 pt-6 mt-6";
const sectionTitle = "text-xs uppercase tracking-widest text-gold mb-4";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}

function MultiCheckbox({ options, value, onChange }: { options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  function toggle(opt: string) { onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]); }
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {options.map(opt => (
        <label key={opt.value} className={`flex items-center gap-1 text-[11px] px-2.5 py-1 border cursor-pointer transition-colors select-none ${value.includes(opt.value) ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-text-muted hover:border-white/25"}`}>
          <input type="checkbox" checked={value.includes(opt.value)} onChange={() => toggle(opt.value)} className="hidden" />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function UploadButton({ onUrl, label }: { onUrl: (url: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = typeof window !== "undefined" ? localStorage.getItem("yvr_admin_token") : null;
      const res = await fetch(`${API_URL}/api/admin/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUrl(`${API_URL}${data.url}`);
    } catch {} finally { setUploading(false); if (ref.current) ref.current.value = ""; }
  }
  return (
    <>
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className="text-[10px] uppercase tracking-widest text-gold border border-gold/30 px-3 py-1 hover:bg-gold/10 transition-colors disabled:opacity-40">
        {uploading ? "Uploading…" : label}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}

function EventForm({ form, setForm, onSubmit, saving, error, submitLabel }: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
  submitLabel: string;
}) {
  function set(field: keyof FormState, value: any) { setForm(f => ({ ...f, [field]: value })); }
  function addArtist() { setForm(f => ({ ...f, lineup: [...f.lineup, { name: "", instagram: "", tiktok: "", youtube: "" }] })); }
  function removeArtist(i: number) { setForm(f => ({ ...f, lineup: f.lineup.filter((_, idx) => idx !== i) })); }
  function setArtist(i: number, field: keyof LineupArtist, value: string) {
    setForm(f => { const lineup = [...f.lineup]; lineup[i] = { ...lineup[i], [field]: value }; return { ...f, lineup }; });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-0">
      {/* Basic */}
      <p className={sectionTitle}>Basic Info</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Event Name *">
          <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Venue ID">
          <input type="number" value={form.venue_id} onChange={e => set("venue_id", e.target.value)} className={inputCls} placeholder="Leave blank to auto-create from n8n" />
        </Field>
        <Field label="Start Date & Time *">
          <input required type="datetime-local" value={form.date} onChange={e => set("date", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Category">
          <input value={form.category} onChange={e => set("category", e.target.value)} className={inputCls} placeholder="rave, latin night, themed…" />
        </Field>
        <Field label="Music Type">
          <select value={form.music_type} onChange={e => set("music_type", e.target.value)} className={inputCls}>
            <option value="">— select —</option>
            {MUSIC_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} className={`${inputCls} resize-none`} />
          </Field>
        </div>
      </div>

      {/* Entry */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Entry & Access</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Entry Types">
              <MultiCheckbox options={ENTRY_TYPE_OPTIONS} value={form.entry_types} onChange={v => set("entry_types", v)} />
            </Field>
          </div>
          <div className="flex gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
              <input type="checkbox" checked={form.our_guestlist} onChange={e => set("our_guestlist", e.target.checked)} className="accent-gold" />
              Guestlist through us
            </label>
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
              <input type="checkbox" checked={form.our_reservation} onChange={e => set("our_reservation", e.target.checked)} className="accent-gold" />
              Reservation through us
            </label>
          </div>
          <div className="md:col-span-2">
            <Field label="External Ticket URL">
              <input value={form.ticket_url} onChange={e => set("ticket_url", e.target.value)} className={inputCls} placeholder="https://dice.fm/…" />
            </Field>
          </div>
        </div>
      </div>

      {/* Lineup */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-4">
          <p className={sectionTitle} style={{ marginBottom: 0 }}>Lineup</p>
          <button type="button" onClick={addArtist} className="text-[10px] uppercase tracking-widest text-gold border border-gold/30 px-3 py-1 hover:bg-gold/10 transition-colors">
            + Add Artist
          </button>
        </div>
        <div className="space-y-4">
          {form.lineup.map((artist, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/[0.02] p-3 border border-white/5">
              <Field label="Name *">
                <input value={artist.name} onChange={e => setArtist(i, "name", e.target.value)} className={inputCls} placeholder="DJ Name" />
              </Field>
              <Field label="Instagram URL">
                <input value={artist.instagram} onChange={e => setArtist(i, "instagram", e.target.value)} className={inputCls} placeholder="https://instagram.com/…" />
              </Field>
              <Field label="TikTok URL">
                <input value={artist.tiktok} onChange={e => setArtist(i, "tiktok", e.target.value)} className={inputCls} placeholder="https://tiktok.com/@…" />
              </Field>
              <Field label="YouTube URL">
                <input value={artist.youtube} onChange={e => setArtist(i, "youtube", e.target.value)} className={inputCls} placeholder="https://youtube.com/…" />
              </Field>
              <div className="col-span-2 md:col-span-4 text-right">
                <button type="button" onClick={() => removeArtist(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>
              </div>
            </div>
          ))}
          {form.lineup.length === 0 && <p className="text-text-muted text-xs">No artists yet.</p>}
        </div>
      </div>

      {/* Media */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Media</p>
        <div className="space-y-4">
          <Field label="Hero Image URL">
            <div className="flex gap-2">
              <input value={form.image_url} onChange={e => set("image_url", e.target.value)} className={`${inputCls} flex-1`} placeholder="https://…" />
              <UploadButton label="Upload" onUrl={url => set("image_url", url)} />
            </div>
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-20 object-cover opacity-70" />}
          </Field>
          <Field label="Gallery URLs (one per line)">
            <div className="flex gap-2 items-start">
              <textarea rows={4} value={form.gallery_urls} onChange={e => set("gallery_urls", e.target.value)} className={`${inputCls} flex-1 resize-none`} placeholder={"https://…\nhttps://…"} />
              <UploadButton label="Add" onUrl={url => set("gallery_urls", form.gallery_urls ? `${form.gallery_urls}\n${url}` : url)} />
            </div>
          </Field>
          <Field label="Video URL (YouTube or direct MP4)">
            <input value={form.video_url} onChange={e => set("video_url", e.target.value)} className={inputCls} placeholder="https://youtube.com/watch?v=… or https://…/video.mp4" />
          </Field>
        </div>
      </div>

      {/* Status */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Status</p>
        <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={e => set("is_published", e.target.checked)} className="accent-gold" />
          Published
        </label>
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="mt-6">
        <button type="submit" disabled={saving} className="bg-gold text-black text-sm px-8 py-2 font-medium hover:bg-gold/90 transition-colors disabled:opacity-50">
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminEventsPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>({ ...EMPTY_FORM });
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [socialEdits, setSocialEdits] = useState<Record<number, string>>({});
  const [socialSaving, setSocialSaving] = useState<Record<number, boolean>>({});

  async function load() {
    try {
      const res = await adminFetch<any[]>("/api/admin/events?limit=50");
      setData(res);
      const socials: Record<number, string> = {};
      res.forEach((e: any) => { socials[e.id] = String(e.social_proof_count ?? 0); });
      setSocialEdits(socials);
    } catch (e: any) { setError(e.message); }
  }

  async function deleteEvent(id: number) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try { await adminFetch(`/api/admin/events/${id}`, { method: "DELETE" }); load(); } catch {}
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setCreateSaving(true); setCreateError(null);
    try {
      await adminFetch("/api/admin/events", { method: "POST", body: JSON.stringify(buildPayload(createForm)) });
      setCreateForm({ ...EMPTY_FORM }); setShowCreate(false); load();
    } catch (e: any) { setCreateError(e.message); }
    finally { setCreateSaving(false); }
  }

  async function openEdit(id: number) {
    try {
      const event = await adminFetch<any>(`/api/admin/events/${id}`);
      setEditForm(eventToForm(event)); setEditingId(id); setEditError(null);
    } catch {}
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId == null) return;
    setEditSaving(true); setEditError(null);
    try {
      await adminFetch(`/api/admin/events/${editingId}`, { method: "PUT", body: JSON.stringify(buildPayload(editForm)) });
      setEditingId(null); load();
    } catch (e: any) { setEditError(e.message); }
    finally { setEditSaving(false); }
  }

  async function setSocialProof(eventId: number) {
    const val = parseInt(socialEdits[eventId] ?? "0", 10);
    if (isNaN(val) || val < 0) return;
    setSocialSaving(s => ({ ...s, [eventId]: true }));
    try {
      await adminFetch(`/api/admin/events/${eventId}/social-proof`, { method: "PUT", body: JSON.stringify({ count: val }) });
      load();
    } catch {}
    finally { setSocialSaving(s => ({ ...s, [eventId]: false })); }
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-text-primary">Events</h1>
        <button onClick={() => { setShowCreate(true); setCreateError(null); setCreateForm({ ...EMPTY_FORM }); }}
          className="text-sm border border-gold/40 text-gold px-4 py-2 hover:bg-gold/10 transition-colors">
          + New Event
        </button>
      </div>

      {showCreate && (
        <AdminModal title="Create Event" onClose={() => setShowCreate(false)}>
          <EventForm form={createForm} setForm={setCreateForm} onSubmit={createEvent} saving={createSaving} error={createError} submitLabel="Create Event" />
        </AdminModal>
      )}

      {editingId != null && (
        <AdminModal title="Edit Event" onClose={() => setEditingId(null)}>
          <EventForm form={editForm} setForm={setEditForm} onSubmit={saveEdit} saving={editSaving} error={editError} submitLabel="Save Changes" />
        </AdminModal>
      )}

      <div className="card-surface p-6">
        <DataTable
          data={data}
          keyField="id"
          columns={[
            { key: "name", label: "Event", render: r => (
              <button onClick={() => openEdit(r.id)} className="text-text-primary hover:text-gold transition-colors text-left font-medium">{r.name}</button>
            )},
            { key: "venue", label: "Venue", render: r => r.venue?.name || "—" },
            { key: "date", label: "Date", render: r => format(new Date(r.date), "MMM d, yyyy h:mm a") },
            { key: "music_type", label: "Music" },
            { key: "entry_types", label: "Entry", render: r => (r.entry_types || []).join(", ") || "—" },
            { key: "social_proof_count", label: "Interest", render: r => (
              <div className="flex items-center gap-1">
                <input type="number" min={0} value={socialEdits[r.id] ?? String(r.social_proof_count ?? 0)}
                  onChange={e => setSocialEdits(s => ({ ...s, [r.id]: e.target.value }))}
                  className="w-16 bg-white/5 border border-white/10 px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-gold/50" />
                <button onClick={() => setSocialProof(r.id)} disabled={socialSaving[r.id]}
                  className="text-[10px] uppercase tracking-widest text-gold hover:text-gold/70 transition-colors disabled:opacity-40">
                  {socialSaving[r.id] ? "…" : "Set"}
                </button>
              </div>
            )},
            { key: "is_published", label: "Published", render: r => r.is_published ? "Yes" : "No" },
            { key: "source", label: "Source" },
            { key: "actions", label: "", render: r => (
              <button onClick={() => deleteEvent(r.id)} className="text-red-400 text-xs hover:text-red-300 transition-colors">Delete</button>
            )},
          ]}
        />
      </div>
    </div>
  );
}
