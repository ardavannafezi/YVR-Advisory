import type { Metadata } from "next";
import { GuestlistFormClient } from "@/components/forms/GuestlistFormClient";

export const metadata: Metadata = {
  title: "Free Guestlist — Vancouver Nightclubs & Events | YVR Advisory",
  description:
    "Join the guestlist at Vancouver's best nightclubs and events. Priority access, skip the line. Submit your request in seconds.",
  keywords: [
    "Vancouver nightclub guestlist",
    "free guestlist Vancouver",
    "Vancouver club access",
    "skip the line Vancouver",
    "Vancouver nightlife guestlist",
    "Vancouver events guestlist",
    "club guestlist Vancouver",
  ],
  alternates: { canonical: "/guestlist" },
  openGraph: {
    type: "website",
    siteName: "YVR Advisory",
    title: "Free Guestlist — Vancouver Nightclubs & Events | YVR Advisory",
    description: "Priority access to Vancouver's best nightclubs and events. Join the guestlist in seconds.",
    url: "/guestlist",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "YVR Advisory Guestlist" }],
  },
};

export default function GuestlistPage() {
  return <GuestlistFormClient />;
}
