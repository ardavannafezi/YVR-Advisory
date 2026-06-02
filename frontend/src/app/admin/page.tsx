"use client";

import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    href: "/admin/analytics",
    title: "Analytics",
    description: "Sessions, guestlist signups, reservation stats.",
  },
  {
    href: "/admin/venues",
    title: "Venues",
    description: "Manage venue listings, music types, and tags.",
  },
  {
    href: "/admin/events",
    title: "Events",
    description: "Upcoming events, dates, and venue assignments.",
  },
  {
    href: "/admin/blog",
    title: "Blog",
    description: "Write and manage blog posts, SEO metadata.",
  },
  {
    href: "/admin/guestlist",
    title: "Guestlist",
    description: "View and export guestlist submissions.",
  },
  {
    href: "/admin/reservations",
    title: "Reservations",
    description: "Approve or reject table reservation requests.",
  },
  {
    href: "/admin/settings",
    title: "Settings",
    description: "Configure email (SMTP) and Telegram notifications.",
  },
];

const API = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";

function ContextApiCard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const endpointUrl = `${API}/api/webhooks/context`;

  async function preview() {
    setLoading(true);
    setError(null);
    try {
      const { getToken } = await import("@/lib/auth");
      const token = getToken();
      const res = await fetch(`${API}/api/admin/n8n-context`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setData(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card-surface p-6 sm:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <p className="font-serif text-xl text-text-primary">n8n Context API</p>
        <div className="flex gap-2">
          <button
            onClick={copyUrl}
            className="text-xs px-3 py-1 border border-white/10 rounded hover:border-gold/40 text-text-muted hover:text-gold transition-colors"
          >
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <button
            onClick={preview}
            disabled={loading}
            className="text-xs px-3 py-1 border border-gold/30 rounded hover:border-gold text-gold transition-colors disabled:opacity-40"
          >
            {loading ? "Loading…" : "Preview"}
          </button>
        </div>
      </div>
      <p className="text-text-dim text-sm mb-3">
        Knowledge base for n8n bots — venues, music types, vibe tags, existing blog tags, and all page URLs.
        Use <code className="text-gold/80 text-xs bg-white/5 px-1 rounded">GET /api/webhooks/context</code> with{" "}
        <code className="text-gold/80 text-xs bg-white/5 px-1 rounded">X-API-Key</code> header.
      </p>
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      {data && (
        <pre className="text-xs text-text-dim bg-black/40 border border-white/5 rounded p-3 overflow-auto max-h-64">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-text-primary mb-2">Dashboard</h1>
        <div className="w-10 h-px bg-gold mb-4" />
        <p className="text-text-muted text-sm">Welcome back. Select a section to get started.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="card-surface p-6 group hover:border-gold/30 transition-colors duration-200 block"
          >
            <p className="font-serif text-xl text-text-primary group-hover:text-gold transition-colors mb-1">
              {title}
            </p>
            <p className="text-text-dim text-sm">{description}</p>
          </Link>
        ))}
        <ContextApiCard />
      </div>
    </div>
  );
}
