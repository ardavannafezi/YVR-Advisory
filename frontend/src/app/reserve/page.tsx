import type { Metadata } from "next";
import { ReserveFormClient } from "@/components/forms/ReserveFormClient";

export const metadata: Metadata = {
  title: "VIP Table Reservations — Vancouver Nightclubs | YVR Advisory",
  description:
    "Reserve a VIP table at Vancouver's top nightclubs and bars. Bottle service, private tables, and curated experiences — book with YVR Advisory.",
  keywords: [
    "Vancouver bottle service",
    "VIP table reservation Vancouver",
    "Vancouver table booking",
    "bottle service Vancouver nightclub",
    "Vancouver nightclub reservation",
    "private table Vancouver",
    "Vancouver VIP experience",
    "table service Vancouver",
  ],
  alternates: { canonical: "/reserve" },
  openGraph: {
    type: "website",
    siteName: "YVR Advisory",
    title: "VIP Table Reservations — Vancouver Nightclubs | YVR Advisory",
    description: "Bottle service and private table reservations at Vancouver's best nightclubs. Book with YVR Advisory.",
    url: "/reserve",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "YVR Advisory Table Reservations" }],
  },
};

export default function ReservePage() {
  return <ReserveFormClient />;
}
