import type { Metadata } from "next";
import { api } from "@/lib/api";
import { GenreGrid } from "@/components/music/GenreGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Genre } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Vancouver Nightlife by Music Genre | YVR Advisory",
  description:
    "Find Vancouver venues and events by music type — techno, house, hip-hop, Latin, R&B, and more. Discover the city's best nights by sound.",
  keywords: [
    "techno Vancouver",
    "house music Vancouver",
    "hip hop night Vancouver",
    "latin night Vancouver",
    "R&B club Vancouver",
    "EDM Vancouver",
    "Vancouver music scene",
    "dance music Vancouver",
    "Vancouver DJ events",
  ],
  alternates: { canonical: "/music" },
  openGraph: {
    type: "website",
    siteName: "YVR Advisory",
    title: "Vancouver Nightlife by Music Genre | YVR Advisory",
    description: "Find Vancouver venues and events by music — techno, house, hip-hop, Latin, R&B, and more.",
    url: "/music",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Vancouver Music — YVR Advisory" }],
  },
};

export default async function MusicPage() {
  try {
    const genres = await api.get<Genre[]>("/api/music/genres");
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            eyebrow="Browse by Sound"
            title="Music"
            subtitle="Find the perfect night by the music that moves you."
            center
          />
          {genres.length === 0 ? (
            <p className="text-text-muted text-center">No genres available yet.</p>
          ) : (
            <GenreGrid genres={genres} />
          )}
        </div>
      </div>
    );
  } catch {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <ErrorState message="Could not load music genres." />
      </div>
    );
  }
}
