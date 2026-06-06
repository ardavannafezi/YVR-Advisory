"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { AdminModal } from "@/components/admin/AdminModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";

const ESTABLISHMENT_TYPES = ["Nightclub", "Cocktail Bar", "Bar & Restaurant", "Rooftop Lounge"];
const PRICE_TIERS = ["$", "$$", "$$$"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const MUSIC_TYPES_OPTIONS = ["house", "techno", "hip-hop", "r&b", "top 40", "latin", "afrobeats", "dancehall", "reggaeton", "edm", "live", "pop", "k-pop", "country", "rock", "indie", "electronic"];
const VIBE_TAGS_OPTIONS = ["luxury", "upscale", "high-energy", "bottle service", "multi-room", "intimate", "underground", "dance floor", "VIP", "rooftop", "date night", "craft cocktails", "live events", "casual", "queer-friendly", "after-hours", "art-driven", "cocktail-forward", "scenic", "dark", "moody", "polished", "inclusive"];
const PRIMARY_CATEGORIES_OPTIONS = ["nightclub", "bar", "lounge", "live_music"];

type Day = typeof DAYS[number];

interface VenueRow {
  id: number;
  slug: string;
  name: string;
  neighbourhood: string | null;
  music_types: string[];
  is_active: boolean;
  is_featured: boolean;
  view_count: number | null;
  advisory_rating: number | null;
}

interface FormState {
  name: string;
  description: string;
  address: string;
  neighbourhood: string;
  phone: string;
  establishment_type: string;
  primary_categories: string[];
  music_types: string[];
  vibe_tags: string[];
  primary_nights: string[];
  hours: Record<Day, string>;
  special_nights: string;
  special_occasion: string;
  price_tier: string;
  cover_charge_info: string;
  bottle_minimum: string;
  dress_code: string;
  age_restriction: string;
  capacity: string;
  hospitality_company: string;
  image_url: string;
  logo_url: string;
  gallery_urls: string;
  latitude: string;
  longitude: string;
  website_url: string;
  instagram_url: string;
  reservation_link: string;
  guestlist_enabled: boolean;
  bottle_service_enabled: boolean;
  guestlist_close_time: string;
  is_active: boolean;
  is_featured: boolean;
  faqs: { question: string; answer: string }[];
}

const EMPTY_HOURS: Record<Day, string> = {
  monday: "", tuesday: "", wednesday: "", thursday: "",
  friday: "", saturday: "", sunday: "",
};

const EMPTY_FORM: FormState = {
  name: "", description: "", address: "", neighbourhood: "", phone: "",
  establishment_type: "", primary_categories: [],
  music_types: [], vibe_tags: [],
  primary_nights: [], hours: { ...EMPTY_HOURS },
  special_nights: "", special_occasion: "",
  price_tier: "", cover_charge_info: "", bottle_minimum: "",
  dress_code: "", age_restriction: "", capacity: "", hospitality_company: "",
  image_url: "", logo_url: "", gallery_urls: "",
  latitude: "", longitude: "",
  website_url: "", instagram_url: "", reservation_link: "",
  guestlist_enabled: false, bottle_service_enabled: false, guestlist_close_time: "",
  is_active: true, is_featured: false,
  faqs: [],
};

function splitCSV(v: string): string[] {
  return v.split(",").map(s => s.trim()).filter(Boolean);
}

function buildPayload(form: FormState) {
  const hours: Record<string, string | null> = {};
  for (const day of DAYS) {
    hours[day] = form.hours[day].trim() || null;
  }
  return {
    name: form.name,
    description: form.description || null,
    address: form.address || null,
    neighbourhood: form.neighbourhood || null,
    phone: form.phone || null,
    establishment_type: form.establishment_type || null,
    primary_categories: form.primary_categories,
    music_types: form.music_types,
    vibe_tags: form.vibe_tags,
    primary_nights: form.primary_nights,
    hours: Object.values(hours).some(v => v !== null) ? hours : null,
    special_nights: splitCSV(form.special_nights),
    special_occasion: form.special_occasion || null,
    price_tier: form.price_tier || null,
    cover_charge_info: form.cover_charge_info || null,
    bottle_minimum: form.bottle_minimum ? parseInt(form.bottle_minimum) : null,
    dress_code: form.dress_code || null,
    age_restriction: form.age_restriction ? parseInt(form.age_restriction) : null,
    capacity: form.capacity ? parseInt(form.capacity) : null,
    hospitality_company: form.hospitality_company || null,
    image_url: form.image_url || null,
    logo_url: form.logo_url || null,
    gallery_urls: form.gallery_urls.split("\n").map(s => s.trim()).filter(Boolean),
    latitude: form.latitude ? parseFloat(form.latitude) : null,
    longitude: form.longitude ? parseFloat(form.longitude) : null,
    website_url: form.website_url || null,
    instagram_url: form.instagram_url || null,
    reservation_link: form.reservation_link || null,
    guestlist_enabled: form.guestlist_enabled,
    bottle_service_enabled: form.bottle_service_enabled,
    guestlist_close_time: form.guestlist_close_time || null,
    is_active: form.is_active,
    is_featured: form.is_featured,
    faqs: form.faqs.length > 0 ? form.faqs : null,
  };
}

function venueToForm(v: any): FormState {
  const hours: Record<Day, string> = { ...EMPTY_HOURS };
  if (v.hours) {
    for (const day of DAYS) {
      hours[day] = v.hours[day] || "";
    }
  }
  return {
    name: v.name || "",
    description: v.description || "",
    address: v.address || "",
    neighbourhood: v.neighbourhood || "",
    phone: v.phone || "",
    establishment_type: v.establishment_type || "",
    primary_categories: v.primary_categories || [],
    music_types: v.music_types || [],
    vibe_tags: v.vibe_tags || [],
    primary_nights: v.primary_nights || [],
    hours,
    special_nights: (v.special_nights || []).join(", "),
    special_occasion: v.special_occasion || "",
    price_tier: v.price_tier || "",
    cover_charge_info: v.cover_charge_info || "",
    bottle_minimum: v.bottle_minimum != null ? String(v.bottle_minimum) : "",
    dress_code: v.dress_code || "",
    age_restriction: v.age_restriction != null ? String(v.age_restriction) : "",
    capacity: v.capacity != null ? String(v.capacity) : "",
    hospitality_company: v.hospitality_company || "",
    image_url: v.image_url || "",
    logo_url: v.logo_url || "",
    gallery_urls: (v.gallery_urls || []).join("\n"),
    latitude: v.latitude != null ? String(v.latitude) : "",
    longitude: v.longitude != null ? String(v.longitude) : "",
    website_url: v.website_url || "",
    instagram_url: v.instagram_url || "",
    reservation_link: v.reservation_link || "",
    guestlist_enabled: v.guestlist_enabled ?? false,
    bottle_service_enabled: v.bottle_service_enabled ?? false,
    guestlist_close_time: v.guestlist_close_time || "",
    is_active: v.is_active ?? true,
    is_featured: v.is_featured ?? false,
    faqs: v.faqs || [],
  };
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
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUrl(`${API_URL}${data.url}`);
    } catch {}
    finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="text-[10px] uppercase tracking-widest text-gold border border-gold/30 px-3 py-1 hover:bg-gold/10 transition-colors disabled:opacity-40"
      >
        {uploading ? "Uploading…" : label}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}

function MultiCheckbox({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  }
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {options.map(opt => (
        <label
          key={opt}
          className={`flex items-center gap-1 text-[11px] px-2.5 py-1 border cursor-pointer transition-colors select-none ${
            value.includes(opt)
              ? "border-gold bg-gold/10 text-gold"
              : "border-white/10 text-text-muted hover:border-white/25"
          }`}
        >
          <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} className="hidden" />
          {opt}
        </label>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50";
const sectionCls = "border-t border-white/10 pt-6 mt-6";
const sectionTitle = "text-xs uppercase tracking-widest text-gold mb-4";

function VenueForm({
  form,
  setForm,
  onSubmit,
  saving,
  error,
  submitLabel,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
  submitLabel: string;
}) {
  function set(field: keyof FormState, value: any) {
    setForm(f => ({ ...f, [field]: value }));
  }
  function setHour(day: Day, value: string) {
    setForm(f => ({ ...f, hours: { ...f.hours, [day]: value } }));
  }
  function addFaq() {
    setForm(f => ({ ...f, faqs: [...f.faqs, { question: "", answer: "" }] }));
  }
  function removeFaq(i: number) {
    setForm(f => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));
  }
  function setFaq(i: number, field: "question" | "answer", value: string) {
    setForm(f => {
      const faqs = [...f.faqs];
      faqs[i] = { ...faqs[i], [field]: value };
      return { ...f, faqs };
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-0">
      {/* Basic Info */}
      <p className={sectionTitle}>Basic Info</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name *">
          <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Neighbourhood">
          <input value={form.neighbourhood} onChange={e => set("neighbourhood", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Establishment Type">
          <select value={form.establishment_type} onChange={e => set("establishment_type", e.target.value)} className={inputCls}>
            <option value="">— select —</option>
            {ESTABLISHMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Primary Categories">
          <MultiCheckbox options={PRIMARY_CATEGORIES_OPTIONS} value={form.primary_categories} onChange={v => set("primary_categories", v)} />
        </Field>
        <Field label="Address">
          <input value={form.address} onChange={e => set("address", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} placeholder="+1 604 000 0000" />
        </Field>
        <Field label="Hospitality Company">
          <input value={form.hospitality_company} onChange={e => set("hospitality_company", e.target.value)} className={inputCls} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} className={`${inputCls} resize-none`} />
          </Field>
        </div>
      </div>

      {/* Music & Vibe */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Music & Vibe</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Music Types">
              <MultiCheckbox options={MUSIC_TYPES_OPTIONS} value={form.music_types} onChange={v => set("music_types", v)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Vibe Tags">
              <MultiCheckbox options={VIBE_TAGS_OPTIONS} value={form.vibe_tags} onChange={v => set("vibe_tags", v)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Operations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Primary Nights">
            <MultiCheckbox options={[...DAYS]} value={form.primary_nights} onChange={v => set("primary_nights", v)} />
          </Field>
          <Field label="Special Nights (comma-separated)">
            <input value={form.special_nights} onChange={e => set("special_nights", e.target.value)} className={inputCls} placeholder="Mansion Fridays — Hip-Hop from $500" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Special Occasion">
              <input value={form.special_occasion} onChange={e => set("special_occasion", e.target.value)} className={inputCls} placeholder="Birthday booths, bachelorette packages…" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Hours (empty = closed)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS.map(day => (
                <div key={day}>
                  <label className="block text-[10px] text-text-muted capitalize mb-1">{day}</label>
                  <input
                    value={form.hours[day]}
                    onChange={e => setHour(day, e.target.value)}
                    className={inputCls}
                    placeholder="9:00 PM – 3:00 AM"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Access */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Pricing & Access</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Price Tier">
            <select value={form.price_tier} onChange={e => set("price_tier", e.target.value)} className={inputCls}>
              <option value="">— select —</option>
              {PRICE_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Bottle Minimum (CAD)">
            <input type="number" value={form.bottle_minimum} onChange={e => set("bottle_minimum", e.target.value)} className={inputCls} placeholder="500" />
          </Field>
          <Field label="Age Restriction">
            <input type="number" value={form.age_restriction} onChange={e => set("age_restriction", e.target.value)} className={inputCls} placeholder="19" />
          </Field>
          <Field label="Capacity">
            <input type="number" value={form.capacity} onChange={e => set("capacity", e.target.value)} className={inputCls} placeholder="300" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Cover Charge Info">
              <input value={form.cover_charge_info} onChange={e => set("cover_charge_info", e.target.value)} className={inputCls} placeholder="Free before midnight on guestlist, $20 door" />
            </Field>
          </div>
          <div className="md:col-span-3">
            <Field label='Dress Code (format: "Label — detail")'>
              <input value={form.dress_code} onChange={e => set("dress_code", e.target.value)} className={inputCls} placeholder='Smart Casual — No athletic wear or open-toed shoes' />
            </Field>
          </div>
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
          <Field label="Logo URL">
            <div className="flex gap-2">
              <input value={form.logo_url} onChange={e => set("logo_url", e.target.value)} className={`${inputCls} flex-1`} placeholder="https://…" />
              <UploadButton label="Upload" onUrl={url => set("logo_url", url)} />
            </div>
            {form.logo_url && <img src={form.logo_url} alt="" className="mt-2 h-12 object-contain opacity-70" />}
          </Field>
          <Field label="Gallery URLs (one per line)">
            <div className="flex gap-2 items-start">
              <textarea
                rows={4}
                value={form.gallery_urls}
                onChange={e => set("gallery_urls", e.target.value)}
                className={`${inputCls} flex-1 resize-none`}
                placeholder={"https://…\nhttps://…"}
              />
              <UploadButton
                label="Add"
                onUrl={url => set("gallery_urls", form.gallery_urls ? `${form.gallery_urls}\n${url}` : url)}
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Maps & Links */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Maps & Links</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Latitude">
            <input type="number" step="any" value={form.latitude} onChange={e => set("latitude", e.target.value)} className={inputCls} placeholder="49.2827" />
          </Field>
          <Field label="Longitude">
            <input type="number" step="any" value={form.longitude} onChange={e => set("longitude", e.target.value)} className={inputCls} placeholder="-123.1207" />
          </Field>
          <Field label="Website URL">
            <input value={form.website_url} onChange={e => set("website_url", e.target.value)} className={inputCls} placeholder="https://…" />
          </Field>
          <Field label="Instagram URL">
            <input value={form.instagram_url} onChange={e => set("instagram_url", e.target.value)} className={inputCls} placeholder="https://instagram.com/…" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Reservation Link">
              <input value={form.reservation_link} onChange={e => set("reservation_link", e.target.value)} className={inputCls} placeholder="https://…" />
            </Field>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-4">
          <p className={sectionTitle} style={{ marginBottom: 0 }}>FAQs</p>
          <button type="button" onClick={addFaq} className="text-[10px] uppercase tracking-widest text-gold border border-gold/30 px-3 py-1 hover:bg-gold/10 transition-colors">
            + Add FAQ
          </button>
        </div>
        <div className="space-y-4">
          {form.faqs.map((faq, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/[0.02] p-3 border border-white/5">
              <Field label="Question">
                <input value={faq.question} onChange={e => setFaq(i, "question", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Answer">
                <input value={faq.answer} onChange={e => setFaq(i, "answer", e.target.value)} className={inputCls} />
              </Field>
              <div className="md:col-span-2 text-right">
                <button type="button" onClick={() => removeFaq(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>
              </div>
            </div>
          ))}
          {form.faqs.length === 0 && <p className="text-text-muted text-xs">No FAQs yet.</p>}
        </div>
      </div>

      {/* Services */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Services & Access</p>
        <div className="flex gap-6 flex-wrap mb-4">
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input type="checkbox" checked={form.guestlist_enabled} onChange={e => set("guestlist_enabled", e.target.checked)} className="accent-gold" />
            Guestlist enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input type="checkbox" checked={form.bottle_service_enabled} onChange={e => set("bottle_service_enabled", e.target.checked)} className="accent-gold" />
            Bottle service enabled
          </label>
        </div>
        <div className="max-w-xs">
          <Field label='Default guestlist close time (HH:MM, Pacific) e.g. "02:00"'>
            <input value={form.guestlist_close_time} onChange={e => set("guestlist_close_time", e.target.value)} className={inputCls} placeholder="02:00" />
          </Field>
        </div>
      </div>

      {/* Status */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Status</p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="accent-gold" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => set("is_featured", e.target.checked)} className="accent-gold" />
            Featured (shown on homepage)
          </label>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="mt-6">
        <button
          type="submit"
          disabled={saving}
          className="bg-gold text-black text-sm px-8 py-2 font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminVenuesPage() {
  const [data, setData] = useState<VenueRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>({ ...EMPTY_FORM });
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit modal
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Inline view count edits
  const [viewEdits, setViewEdits] = useState<Record<number, string>>({});
  const [viewSaving, setViewSaving] = useState<Record<number, boolean>>({});

  // Inline advisory rating edits
  const [ratingEdits, setRatingEdits] = useState<Record<number, string>>({});
  const [ratingSaving, setRatingSaving] = useState<Record<number, boolean>>({});

  async function load() {
    try {
      const res = await adminFetch<VenueRow[]>("/api/admin/venues?limit=100");
      setData(res);
      const views: Record<number, string> = {};
      const ratings: Record<number, string> = {};
      res.forEach(v => {
        views[v.id] = String(v.view_count ?? 0);
        ratings[v.id] = v.advisory_rating != null ? String(v.advisory_rating) : "";
      });
      setViewEdits(views);
      setRatingEdits(ratings);
    } catch (e: any) { setError(e.message); }
  }

  async function deleteVenue(id: number) {
    if (!confirm("Delete this venue? This cannot be undone.")) return;
    try {
      await adminFetch(`/api/admin/venues/${id}`, { method: "DELETE" });
      load();
    } catch {}
  }

  async function createVenue(e: React.FormEvent) {
    e.preventDefault();
    setCreateSaving(true);
    setCreateError(null);
    try {
      await adminFetch("/api/admin/venues", { method: "POST", body: JSON.stringify(buildPayload(createForm)) });
      setCreateForm({ ...EMPTY_FORM });
      setShowCreate(false);
      load();
    } catch (e: any) { setCreateError(e.message); }
    finally { setCreateSaving(false); }
  }

  async function openEdit(id: number) {
    try {
      const venue = await adminFetch<any>(`/api/admin/venues/${id}`);
      setEditForm(venueToForm(venue));
      setEditingId(id);
      setEditError(null);
    } catch {}
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId == null) return;
    setEditSaving(true);
    setEditError(null);
    try {
      await adminFetch(`/api/admin/venues/${editingId}`, { method: "PUT", body: JSON.stringify(buildPayload(editForm)) });
      setEditingId(null);
      load();
    } catch (e: any) { setEditError(e.message); }
    finally { setEditSaving(false); }
  }

  async function setViewCount(venueId: number) {
    const val = parseInt(viewEdits[venueId] ?? "0", 10);
    if (isNaN(val) || val < 0) return;
    setViewSaving(s => ({ ...s, [venueId]: true }));
    try {
      await adminFetch(`/api/admin/venues/${venueId}/views`, { method: "PUT", body: JSON.stringify({ view_count: val }) });
      load();
    } catch {}
    finally { setViewSaving(s => ({ ...s, [venueId]: false })); }
  }

  async function setRating(venueId: number) {
    const val = parseFloat(ratingEdits[venueId] ?? "");
    if (isNaN(val) || val < 0 || val > 10) return;
    setRatingSaving(s => ({ ...s, [venueId]: true }));
    try {
      await adminFetch(`/api/admin/venues/${venueId}/rating`, { method: "PUT", body: JSON.stringify({ rating: val }) });
      load();
    } catch {}
    finally { setRatingSaving(s => ({ ...s, [venueId]: false })); }
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-text-primary">Venues</h1>
        <button
          onClick={() => { setShowCreate(true); setCreateError(null); setCreateForm({ ...EMPTY_FORM }); }}
          className="text-sm border border-gold/40 text-gold px-4 py-2 hover:bg-gold/10 transition-colors"
        >
          + New Venue
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <AdminModal title="Create Venue" onClose={() => setShowCreate(false)}>
          <VenueForm
            form={createForm}
            setForm={setCreateForm}
            onSubmit={createVenue}
            saving={createSaving}
            error={createError}
            submitLabel="Create Venue"
          />
        </AdminModal>
      )}

      {/* Edit modal (full screen overlay) */}
      {editingId != null && (
        <AdminModal title="Edit Venue" onClose={() => setEditingId(null)}>
          <VenueForm
            form={editForm}
            setForm={setEditForm}
            onSubmit={saveEdit}
            saving={editSaving}
            error={editError}
            submitLabel="Save Changes"
          />
        </AdminModal>
      )}

      {/* Table */}
      <div className="card-surface p-6">
        <DataTable
          data={data}
          keyField="id"
          columns={[
            {
              key: "name",
              label: "Name",
              render: r => (
                <button onClick={() => openEdit(r.id)} className="text-text-primary hover:text-gold transition-colors text-left font-medium">
                  {r.name}
                </button>
              ),
            },
            { key: "neighbourhood", label: "Neighbourhood" },
            { key: "music_types", label: "Music", render: r => (r.music_types || []).join(", ") },
            { key: "is_active", label: "Active", render: r => r.is_active ? "Yes" : "No" },
            {
              key: "advisory_rating",
              label: "Advisory Rating",
              render: r => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={ratingEdits[r.id] ?? ""}
                      onChange={e => setRatingEdits(s => ({ ...s, [r.id]: e.target.value }))}
                      className="w-16 bg-white/5 border border-white/10 px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-gold/50"
                      placeholder="0–10"
                    />
                    <button
                      onClick={() => setRating(r.id)}
                      disabled={ratingSaving[r.id]}
                      className="text-[10px] uppercase tracking-widest text-gold hover:text-gold/70 transition-colors disabled:opacity-40"
                    >
                      {ratingSaving[r.id] ? "…" : "Set"}
                    </button>
                  </div>
                  {r.advisory_rating != null && (
                    <span className="text-[9px] text-gold/50">saved: {r.advisory_rating}</span>
                  )}
                </div>
              ),
            },
            {
              key: "view_count",
              label: "Views",
              render: r => (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    value={viewEdits[r.id] ?? String(r.view_count ?? 0)}
                    onChange={e => setViewEdits(s => ({ ...s, [r.id]: e.target.value }))}
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
              render: r => (
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
