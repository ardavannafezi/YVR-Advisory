"use client";

import { useEffect } from "react";
import { gtagEvent } from "@/lib/gtag";

interface Props {
  eventId: number;
  eventName: string;
  venueName?: string;
  musicType?: string;
  date: string;
}

export function EventPageTracker({ eventId, eventName, venueName, musicType, date }: Props) {
  useEffect(() => {
    gtagEvent("view_item", {
      item_id: String(eventId),
      item_name: eventName,
      item_category: musicType ?? "Event",
      item_variant: venueName ?? "",
      item_list_name: "Events",
      event_date: date,
    });
  }, [eventId, eventName, venueName, musicType, date]);

  return null;
}
