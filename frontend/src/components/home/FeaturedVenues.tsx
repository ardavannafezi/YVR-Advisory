import Link from "next/link";
import { api } from "@/lib/api";
import { VenueCard } from "@/components/venues/VenueCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Venue } from "@/types";

async function getFeaturedVenues(category?: string): Promise<Venue[]> {
  try {
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    return await api.get<Venue[]>(`/api/venues/featured${qs}`, { next: { revalidate: 3600 } });
  } catch {
    return [];
  }
}

interface Props {
  category?: string;
  title: string;
  eyebrow?: string;
  linkHref?: string;
  linkLabel?: string;
}

export async function FeaturedVenues({
  category,
  title,
  eyebrow = "Handpicked",
  linkHref,
  linkLabel = "See All →",
}: Props) {
  const venues = await getFeaturedVenues(category);
  if (venues.length === 0) return null;

  const href = linkHref ?? (category ? `/venues?primary_category=${category}` : "/venues");

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-12">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <Link
          href={href}
          className="hidden md:block text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
        >
          {linkLabel}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {venues.map((venue, i) => (
          <VenueCard key={venue.id} venue={venue} index={i} />
        ))}
      </div>
    </section>
  );
}
