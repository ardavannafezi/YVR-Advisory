import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About YVR Advisory — Vancouver Nightlife Guide",
  description: "YVR Advisory is Vancouver's curated nightlife advisor — venues, events, guestlists, and insider access at the city's top clubs and bars.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="pt-32 pb-28 max-w-2xl mx-auto px-6">
      <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">About</p>
      <h1 className="font-serif text-5xl md:text-6xl text-text-primary mb-8">YVR Advisory</h1>

      <div className="space-y-6 text-text-muted leading-relaxed text-base mb-14">
        <p>
          YVR Advisory is Vancouver&apos;s nightlife guide — a curated source for venues, events, guestlist access, and honest recommendations across the city&apos;s top clubs, bars, and lounges.
        </p>
        <p>
          We cover the full spectrum of Vancouver nightlife: from high-energy nightclubs in Granville Entertainment District to intimate cocktail bars in Gastown and rooftop lounges downtown. Every venue and event is hand-selected.
        </p>
        <p>
          Whether you&apos;re looking for a spot tonight or planning a special occasion, we&apos;ll point you in the right direction.
        </p>
      </div>

      <div className="border-t border-white/[0.06] pt-10 space-y-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6">Connect</p>
        <a
          href="https://instagram.com/yvradvisory"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 border border-white/10 px-6 py-4 hover:border-gold/40 hover:text-gold transition-colors group"
        >
          <span className="text-text-dim text-xs uppercase tracking-widest group-hover:text-gold transition-colors">Instagram</span>
          <span className="text-text-primary text-sm ml-auto">@yvradvisory</span>
        </a>
        <div className="flex gap-3 pt-2">
          <Link
            href="/venues"
            className="flex-1 text-center text-[11px] uppercase tracking-widest py-3 border border-white/10 text-text-muted hover:border-gold/40 hover:text-gold transition-colors"
          >
            Browse Venues
          </Link>
          <Link
            href="/events"
            className="flex-1 text-center text-[11px] uppercase tracking-widest py-3 border border-white/10 text-text-muted hover:border-gold/40 hover:text-gold transition-colors"
          >
            Upcoming Events
          </Link>
          <Link
            href="/where-to-go"
            className="flex-1 text-center text-[11px] uppercase tracking-widest py-3 bg-gold text-black hover:bg-gold/90 transition-colors"
          >
            Where to Go
          </Link>
        </div>
      </div>
    </main>
  );
}
