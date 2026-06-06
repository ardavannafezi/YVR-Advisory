"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { adminFetch } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { AdminModal } from "@/components/admin/AdminModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";

const MUSIC_OPTIONS = ["house", "techno", "hip-hop", "r&b", "top 40", "latin", "afrobeats", "dancehall", "reggaeton", "edm", "live", "pop", "k-pop", "country", "rock", "indie", "electronic"];

interface FormState {
  title: string;
  summary: string;
  body: string;
  cover_image_url: string;
  tags: string;
  music_type: string;
  author: string;
  is_published: boolean;
}

const EMPTY_FORM: FormState = {
  title: "", summary: "", body: "", cover_image_url: "",
  tags: "", music_type: "", author: "", is_published: false,
};

function postToForm(p: any): FormState {
  return {
    title: p.title || "",
    summary: p.summary || "",
    body: p.body || "",
    cover_image_url: p.cover_image_url || "",
    tags: (p.tags || []).join(", "),
    music_type: p.music_type || "",
    author: p.author || "",
    is_published: p.is_published ?? false,
  };
}

function buildPayload(form: FormState) {
  return {
    title: form.title,
    summary: form.summary || null,
    body: form.body,
    cover_image_url: form.cover_image_url || null,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    music_type: form.music_type || null,
    author: form.author || null,
    is_published: form.is_published,
  };
}

const inputCls = "w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50";
const sectionTitle = "text-xs uppercase tracking-widest text-gold mb-4";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">{label}</label>
      {children}
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
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUrl(`${API_URL}${data.url}`);
    } catch {}
    finally { setUploading(false); if (ref.current) ref.current.value = ""; }
  }
  return (
    <>
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
        className="text-[10px] uppercase tracking-widest text-gold border border-gold/30 px-3 py-1 hover:bg-gold/10 transition-colors disabled:opacity-40">
        {uploading ? "Uploading…" : label}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}

function BlogForm({ form, setForm, onSubmit, saving, error, submitLabel }: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
  submitLabel: string;
}) {
  function set(field: keyof FormState, value: any) { setForm((f) => ({ ...f, [field]: value })); }

  return (
    <form onSubmit={onSubmit} className="space-y-0">
      <p className={sectionTitle}>Content</p>
      <div className="space-y-4">
        <Field label="Title *">
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Summary (meta description — 1–2 sentences)">
          <textarea rows={2} value={form.summary} onChange={(e) => set("summary", e.target.value)}
            className={`${inputCls} resize-none`} placeholder="Short teaser shown in cards and search results" />
        </Field>
        <Field label="Body (HTML) *">
          <textarea required rows={16} value={form.body} onChange={(e) => set("body", e.target.value)}
            className={`${inputCls} resize-y font-mono text-xs`}
            placeholder="<p>Your article content here. Supports HTML.</p>" />
        </Field>
      </div>

      <div className="border-t border-white/10 pt-6 mt-6">
        <p className={sectionTitle}>Meta & Taxonomy</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Author">
            <input value={form.author} onChange={(e) => set("author", e.target.value)} className={inputCls} placeholder="YVR Advisory" />
          </Field>
          <Field label="Music Type">
            <select value={form.music_type} onChange={(e) => set("music_type", e.target.value)} className={inputCls}>
              <option value="">— none —</option>
              {MUSIC_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Tags (comma-separated)">
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls}
                placeholder="nightlife, vancouver, gastown" />
            </Field>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 mt-6">
        <p className={sectionTitle}>Cover Image</p>
        <Field label="Cover Image URL">
          <div className="flex gap-2">
            <input value={form.cover_image_url} onChange={(e) => set("cover_image_url", e.target.value)}
              className={`${inputCls} flex-1`} placeholder="https://…" />
            <UploadButton label="Upload" onUrl={(url) => set("cover_image_url", url)} />
          </div>
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt="" className="mt-2 h-24 object-cover opacity-70" />
          )}
        </Field>
      </div>

      <div className="border-t border-white/10 pt-6 mt-6">
        <p className={sectionTitle}>Status</p>
        <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} className="accent-gold" />
          Published (visible on site + indexed by search engines)
        </label>
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="mt-6">
        <button type="submit" disabled={saving}
          className="bg-gold text-black text-sm px-8 py-2 font-medium hover:bg-gold/90 transition-colors disabled:opacity-50">
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminBlogPage() {
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

  async function load() {
    try {
      const res = await adminFetch<any[]>("/api/admin/blog?limit=100");
      setData(res);
    } catch (e: any) { setError(e.message); }
  }

  async function deletePost(id: number) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try { await adminFetch(`/api/admin/blog/${id}`, { method: "DELETE" }); load(); } catch {}
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setCreateSaving(true); setCreateError(null);
    try {
      await adminFetch("/api/admin/blog", { method: "POST", body: JSON.stringify(buildPayload(createForm)) });
      setCreateForm({ ...EMPTY_FORM }); setShowCreate(false); load();
    } catch (e: any) { setCreateError(e.message); }
    finally { setCreateSaving(false); }
  }

  async function openEdit(id: number) {
    try {
      const post = await adminFetch<any>(`/api/admin/blog/${id}`);
      setEditForm(postToForm(post)); setEditingId(id); setEditError(null);
    } catch {}
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId == null) return;
    setEditSaving(true); setEditError(null);
    try {
      await adminFetch(`/api/admin/blog/${editingId}`, { method: "PUT", body: JSON.stringify(buildPayload(editForm)) });
      setEditingId(null); load();
    } catch (e: any) { setEditError(e.message); }
    finally { setEditSaving(false); }
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-text-primary">Blog</h1>
        <button onClick={() => { setShowCreate(true); setCreateError(null); setCreateForm({ ...EMPTY_FORM }); }}
          className="text-sm border border-gold/40 text-gold px-4 py-2 hover:bg-gold/10 transition-colors">
          + New Post
        </button>
      </div>

      {showCreate && (
        <AdminModal title="Create Post" onClose={() => setShowCreate(false)}>
          <BlogForm form={createForm} setForm={setCreateForm} onSubmit={createPost} saving={createSaving} error={createError} submitLabel="Create Post" />
        </AdminModal>
      )}

      {editingId != null && (
        <AdminModal title="Edit Post" onClose={() => setEditingId(null)}>
          <BlogForm form={editForm} setForm={setEditForm} onSubmit={saveEdit} saving={editSaving} error={editError} submitLabel="Save Changes" />
        </AdminModal>
      )}

      <div className="card-surface p-6">
        <DataTable
          data={data}
          keyField="id"
          columns={[
            { key: "title", label: "Title", render: (r) => (
              <button onClick={() => openEdit(r.id)} className="text-text-primary hover:text-gold transition-colors text-left font-medium max-w-xs truncate block">
                {r.title}
              </button>
            )},
            { key: "author", label: "Author", render: (r) => r.author || "—" },
            { key: "tags", label: "Tags", render: (r) => (r.tags || []).join(", ") || "—" },
            { key: "music_type", label: "Music", render: (r) => r.music_type || "—" },
            { key: "is_published", label: "Published", render: (r) => r.is_published ? "Yes" : "Draft" },
            { key: "published_at", label: "Date", render: (r) => r.published_at ? format(new Date(r.published_at), "MMM d, yyyy") : "—" },
            { key: "actions", label: "", render: (r) => (
              <div className="flex gap-3">
                <a href={`/blog/${r.slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-gold text-xs hover:text-gold/70 transition-colors">View</a>
                <button onClick={() => deletePost(r.id)} className="text-red-400 text-xs hover:text-red-300 transition-colors">Delete</button>
              </div>
            )},
          ]}
        />
      </div>
    </div>
  );
}
