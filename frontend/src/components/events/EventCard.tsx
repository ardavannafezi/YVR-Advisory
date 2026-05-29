"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fadeUp } from "@/styles/animations";
import { Badge } from "@/components/ui/Badge";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const date = new Date(event.date);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <Link href={`/events/${event.slug}`} className="group block card-surface overflow-hidden hover:border-gold/40 transition-colors duration-300">
        <div className="relative h-48 overflow-hidden bg-white/5">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
          )}
          <div className="absolute top-3 left-3">
            <div className="bg-background/90 backdrop-blur-sm px-3 py-2 text-center border border-white/10">
              <p className="text-gold text-xs uppercase tracking-widest">{format(date, "MMM")}</p>
              <p className="text-text-primary font-serif text-2xl leading-none">{format(date, "d")}</p>
            </div>
          </div>
          {event.music_type && (
            <div className="absolute top-3 right-3">
              <Badge label={event.music_type} variant="gold" />
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-text-dim text-[10px] uppercase tracking-widest mb-1">
            {event.venue?.name} · {format(date, "EEEE, h:mm a")}
          </p>
          <h3 className="font-serif text-xl text-text-primary group-hover:text-gold transition-colors">
            {event.name}
          </h3>
          {event.description && (
            <p className="mt-2 text-text-muted text-sm line-clamp-2 leading-relaxed">{event.description}</p>
          )}
          {event.category && (
            <div className="mt-3">
              <Badge label={event.category} variant="dim" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
