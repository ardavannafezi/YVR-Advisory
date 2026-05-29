import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { GoldButton } from "@/components/ui/GoldButton";
import { VenueJsonLd } from "@/components/venues/VenueJsonLd";
import type { Venue } from "@/types";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const venue = await api.get<Venue>(`/api/venues/${params.slug}`);
    const SITE = process.env.NEXT_PUBLIC_SITE_URL || "";
    return {
      title: `${venue.name} — Vancouver Nightclub`,
      description: venue.description || `Discover ${venue.name}, one of Vancouver's top nightlife destinations.`,
      alternates: { canonical: `/venues/${venue.slug}` },
      openGraph: {
        title: venue.name,
        description: venue.description || "",
        images: venue.image_url ? [{ url: venue.image_url }] : [],
        url: `/venues/${venue.slug}`,
      },
    };
  } catch {
    return { title: "Venue Not Found" };
  }
}

export default async function VenueDetailPage({ params }: { params: { slug: string } }) {
  let venue: Venue;
  try {
    venue = await api.get<Venue>(`/api/venues/${params.slug}`);
  } catch {
    notFound();
  }

  return (
    <>
      <VenueJsonLd venue={venue} />
      <div className="pt-20">
        {/* Hero image */}
        <div className="relative h-[55vh] overflow-hidden">
          {venue.image_url ? (
            <Image src={venue.image_url} alt={venue.name} fill className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-20 pb-24 relative z-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {venue.music_types.map((t) => <Badge key={t} label={t} variant="gold" />)}
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-text-primary mb-2">{venue.name}</h1>
          {venue.neighbourhood && (
            <p className="text-text-muted text-sm uppercase tracking-widest mb-6">{venue.neighbourhood}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
            <div className="md:col-span-2">
              {venue.description && (
                <p className="text-text-muted leading-relaxed mb-8">{venue.description}</p>
              )}
              {venue.address && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-gold mb-1">Address</p>
                  <p className="text-text-muted">{venue.address}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {venue.vibe_tags.map((tag) => <Badge key={tag} label={tag} />)}
              </div>
            </div>

            <div className="card-surface p-6 flex flex-col gap-4">
              <p className="text-xs uppercase tracking-widest text-gold">Reserve or Join</p>
              <Link href={`/reserve?venue_id=${venue.id}`}>
                <GoldButton className="w-full">Reserve a Table</GoldButton>
              </Link>
              <Link href={`/guestlist?venue_id=${venue.id}`}>
                <GoldButton variant="outline" className="w-full">Join Guestlist</GoldButton>
              </Link>
              {venue.website_url && (
                <a href={venue.website_url} target="_blank" rel="noopener noreferrer" className="text-center text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors">
                  Official Website
                </a>
              )}
              {venue.instagram_url && (
                <a href={venue.instagram_url} target="_blank" rel="noopener noreferrer" className="text-center text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors">
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
