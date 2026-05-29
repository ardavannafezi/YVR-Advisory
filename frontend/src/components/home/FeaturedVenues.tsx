import Link from "next/link";
import { api } from "@/lib/api";
import { VenueCard } from "@/components/venues/VenueCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Venue } from "@/types";

async function getFeaturedVenues(): Promise<Venue[]> {
  try {
    return await api.get<Venue[]>("/api/venues/featured", { next: { revalidate: 3600 } });
  } catch {
    return [];
  }
}

export async function FeaturedVenues() {
  const venues = await getFeaturedVenues();

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-end justify-between mb-12">
        <SectionHeading eyebrow="Handpicked" title="Featured Venues" />
        <Link href="/venues" className="hidden md:block text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors">
          All Venues →
        </Link>
      </div>

      {venues.length === 0 ? (
        <p className="text-text-muted">No venues available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {venues.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
