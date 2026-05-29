import type { Metadata } from "next";
import { api } from "@/lib/api";
import { GenreGrid } from "@/components/music/GenreGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Genre } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Vancouver Music & Genres",
  description: "Explore Vancouver nightlife by music type — techno, house, hip-hop, latin, and more.",
  alternates: { canonical: "/music" },
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
