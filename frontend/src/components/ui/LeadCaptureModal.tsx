"use client";

import { useState } from "react";
import { GoldButton } from "@/components/ui/GoldButton";

interface Props {
  redirectUrl: string;
  sourceType: "ticket" | "external_guestlist" | "external_reservation";
  venueName?: string;
  venueType?: string;
  musicType?: string;
  eventName?: string;
  onClose: () => void;
}

export function LeadCaptureModal({ redirectUrl, sourceType, venueName, venueType, musicType, eventName, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = sourceType === "ticket" ? "Get Tickets" : sourceType === "external_guestlist" ? "Join Guestlist" : "Book Directly";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";
      await fetch(`${BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source_type: sourceType, venue_name: venueName, venue_type: venueType, music_type: musicType, event_name: eventName, redirect_url: redirectUrl }),
      });
    } catch {
      // silently continue — don't block the user from proceeding
    } finally {
      window.open(redirectUrl, "_blank", "noopener,noreferrer");
      onClose();
    }
  }

  function handleSkip() {
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-md p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-dim hover:text-text-primary text-lg leading-none">×</button>

        <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-3">One Quick Step</p>
        <h2 className="font-serif text-2xl text-text-primary mb-2">
          {sourceType === "ticket" ? "Get Your Tickets" : sourceType === "external_guestlist" ? "Join the Guestlist" : "Book Your Table"}
        </h2>
        {(venueName || eventName) && (
          <p className="text-text-dim text-xs mb-6">
            {eventName ? `${eventName}${venueName ? ` at ${venueName}` : ""}` : venueName}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-dim block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-dim block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <p className="text-[10px] text-text-dim leading-relaxed">
            By continuing, you agree your name and email may be used by YVR Advisory for personalized marketing and event recommendations.
          </p>

          <GoldButton type="submit" disabled={submitting} className="mt-1">
            {submitting ? "Continuing..." : `Continue to ${label}`}
          </GoldButton>
        </form>

        <button onClick={handleSkip} className="mt-3 w-full text-[10px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors py-1">
          Skip and continue
        </button>
      </div>
    </div>
  );
}
