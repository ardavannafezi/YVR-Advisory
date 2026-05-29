import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { GoldButton } from "@/components/ui/GoldButton";
import { EventJsonLd } from "@/components/events/EventJsonLd";
import type { Event } from "@/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const event = await api.get<Event>(`/api/events/${params.slug}`);
    return {
      title: `${event.name} at ${event.venue?.name || "Vancouver"}`,
      description: event.description || `${event.name} — ${format(new Date(event.date), "MMMM d, yyyy")} in Vancouver.`,
      alternates: { canonical: `/events/${event.slug}` },
      openGraph: {
        title: event.name,
        description: event.description || "",
        images: event.image_url ? [{ url: event.image_url }] : [],
        url: `/events/${event.slug}`,
      },
    };
  } catch {
    return { title: "Event Not Found" };
  }
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  let event: Event;
  try {
    event = await api.get<Event>(`/api/events/${params.slug}`);
  } catch {
    notFound();
  }

  const date = new Date(event.date);

  return (
    <>
      <EventJsonLd event={event} />
      <div className="pt-20">
        <div className="relative h-[50vh] overflow-hidden">
          {event.image_url ? (
            <Image src={event.image_url} alt={event.name} fill className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-16 pb-24 relative z-10">
          <div className="flex gap-2 mb-4 flex-wrap">
            {event.music_type && <Badge label={event.music_type} variant="gold" />}
            {event.category && <Badge label={event.category} />}
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-text-primary mb-2">{event.name}</h1>
          <p className="text-text-muted text-sm uppercase tracking-widest mb-8">
            {format(date, "EEEE, MMMM d, yyyy")} · {format(date, "h:mm a")}
            {event.venue && <> · <Link href={`/venues/${event.venue.slug}`} className="text-gold hover:underline">{event.venue.name}</Link></>}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
              {event.description && (
                <p className="text-text-muted leading-relaxed">{event.description}</p>
              )}
            </div>

            <div className="card-surface p-6 flex flex-col gap-4">
              <p className="text-xs uppercase tracking-widest text-gold">Join</p>
              {event.ticket_url && (
                <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                  <GoldButton className="w-full">Get Tickets</GoldButton>
                </a>
              )}
              <Link href={`/guestlist?event_id=${event.id}`}>
                <GoldButton variant="outline" className="w-full">Join Guestlist</GoldButton>
              </Link>
              {event.venue_id && (
                <Link href={`/reserve?venue_id=${event.venue_id}&event_id=${event.id}`}>
                  <GoldButton variant="ghost" className="w-full">Reserve Table</GoldButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
