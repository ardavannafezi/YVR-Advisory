"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "@/styles/animations";
import { Badge } from "@/components/ui/Badge";
import type { Venue } from "@/types";

interface VenueCardProps {
  venue: Venue;
  index?: number;
}

export function VenueCard({ venue, index = 0 }: VenueCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <Link href={`/venues/${venue.slug}`} className="group block card-surface overflow-hidden hover:border-gold/40 transition-colors duration-300">
        <div className="relative h-56 overflow-hidden bg-white/5">
          {venue.image_url ? (
            <Image
              src={venue.image_url}
              alt={venue.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          )}
          <div className="absolute inset-0 bg-dark-gradient" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {venue.logo_url && (
              <div className="relative w-8 h-8 bg-background/80 border border-white/10 overflow-hidden">
                <Image
                  src={venue.logo_url}
                  alt={`${venue.name} logo`}
                  fill
                  className="object-contain p-0.5"
                  sizes="32px"
                />
              </div>
            )}
            {venue.price_tier && (
              <span className="text-[10px] uppercase tracking-widest text-gold bg-background/80 border border-gold/30 px-2 py-0.5">
                {venue.price_tier}
              </span>
            )}
          </div>
          <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
            {venue.music_types.slice(0, 2).map((type) => (
              <Badge key={type} label={type} variant="gold" />
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-text-dim text-[10px] uppercase tracking-widest">{venue.neighbourhood}</p>
            {venue.primary_nights.length > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-text-muted">
                {venue.primary_nights.slice(0, 2).join(" · ")}
              </p>
            )}
          </div>
          <h3 className="font-serif text-xl text-text-primary group-hover:text-gold transition-colors">
            {venue.name}
          </h3>
          {venue.hospitality_company && (
            <p className="text-[10px] uppercase tracking-widest text-text-dim mt-0.5">{venue.hospitality_company}</p>
          )}
          {venue.description && (
            <p className="mt-2 text-text-muted text-sm line-clamp-2 leading-relaxed">{venue.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {venue.vibe_tags.slice(0, 3).map((tag) => (
              <Badge key={tag} label={tag} variant="dim" />
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
