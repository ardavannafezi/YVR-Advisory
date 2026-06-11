import type { Metadata } from "next";
import Link from "next/link";
import { ORGANIZATION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About YVR Advisory — Vancouver Nightlife Guide",
  description: "YVR Advisory is Vancouver's curated nightlife advisor — venues, events, guestlists, and insider access at the city's top clubs and bars.",
  keywords: [
    "YVR Advisory",
    "Vancouver nightlife guide",
    "Vancouver club advisor",
    "Vancouver nightlife recommendations",
    "about YVR Advisory",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    siteName: "YVR Advisory",
    title: "About YVR Advisory — Vancouver Nightlife Guide",
    description: "Vancouver's curated nightlife advisor — venues, events, guestlists, and insider access at the city's top clubs and bars.",
    url: "/about",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "About YVR Advisory" }],
  },
};

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about#webpage`,
    url: `${SITE_URL}/about`,
    name: "About YVR Advisory",
    description: ORGANIZATION.description,
    inLanguage: "en-CA",
    about: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: ORGANIZATION.name,
      url: SITE_URL,
      email: ORGANIZATION.email,
      sameAs: [ORGANIZATION.instagramUrl],
    },
  };

  return (
    <main className="pt-32 pb-28 max-w-2xl mx-auto px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">About</p>
      <h1 className="font-serif text-5xl md:text-6xl text-text-primary mb-8">YVR Advisory</h1>

      <div className="space-y-6 text-text-muted leading-relaxed text-base mb-14">
        <p>
          {ORGANIZATION.name} is an independent Vancouver nightlife guide publishing curated venue coverage, event listings, guestlist access, and honest recommendations across the city&apos;s clubs, bars, and lounges.
        </p>
        <p>
          Our team focuses on the full spectrum of Vancouver nightlife: from high-energy clubs in the Granville Entertainment District to cocktail bars in Gastown and rooftop lounges downtown. Our goal is to make nightlife research easier, clearer, and more useful for locals and visitors.
        </p>
        <p>
          Whether you&apos;re choosing a spot for tonight or planning a larger night out, YVR Advisory aims to provide current, accountable editorial guidance rooted in Vancouver, BC.
        </p>
      </div>

      <div className="border-t border-white/[0.06] pt-10 mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6">Identity</p>
        <div className="space-y-4 text-sm text-text-muted leading-relaxed">
          <p>
            <span className="text-text-primary">Organization:</span> {ORGANIZATION.name}
          </p>
          <p>
            <span className="text-text-primary">Based in:</span> {ORGANIZATION.location}
          </p>
          <p>
            <span className="text-text-primary">Editorial contact:</span> {ORGANIZATION.email}
          </p>
          <p>
            <span className="text-text-primary">Instagram:</span> {ORGANIZATION.instagramHandle}
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-10 mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6">For Venues &amp; Organizers</p>
        <p className="text-text-muted text-sm leading-relaxed mb-4">
          Venue owner, event organizer, or promoter? For inquiries, listing requests, or removal requests, reach us directly:
        </p>
        <a
          href={`mailto:${ORGANIZATION.email}`}
          className="flex items-center gap-4 border border-white/10 px-6 py-4 hover:border-gold/40 hover:text-gold transition-colors group"
        >
          <span className="text-text-dim text-xs uppercase tracking-widest group-hover:text-gold transition-colors">Email</span>
          <span className="text-text-primary text-sm ml-auto">{ORGANIZATION.email}</span>
        </a>
      </div>

      <div className="border-t border-white/[0.06] pt-10 space-y-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6">Connect</p>
        <a
          href={ORGANIZATION.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 border border-white/10 px-6 py-4 hover:border-gold/40 hover:text-gold transition-colors group"
        >
          <span className="text-text-dim text-xs uppercase tracking-widest group-hover:text-gold transition-colors">Instagram</span>
          <span className="text-text-primary text-sm ml-auto">{ORGANIZATION.instagramHandle}</span>
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
