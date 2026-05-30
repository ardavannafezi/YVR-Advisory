"use client";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";

export function VenueViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`${API_URL}/api/venues/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);
  return null;
}
