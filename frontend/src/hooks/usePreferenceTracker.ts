"use client";

import { useCallback } from "react";
import { track } from "@/lib/analytics";

export function usePreferenceTracker() {
  const trackMusicView = useCallback((genre: string) => {
    track("music_view", { genre });
  }, []);

  const trackVenueView = useCallback((venueName: string, venueType?: string) => {
    track("venue_view", { venue_name: venueName, venue_type: venueType });
  }, []);

  const trackQuizStep = useCallback((answers: Record<string, unknown>) => {
    track("quiz_step", answers);
  }, []);

  const trackFilter = useCallback((filters: Record<string, unknown>) => {
    track("filter", filters);
  }, []);

  return { trackMusicView, trackVenueView, trackQuizStep, trackFilter };
}
