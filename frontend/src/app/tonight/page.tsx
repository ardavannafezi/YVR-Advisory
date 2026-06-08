import type { Metadata } from "next";
import { TonightPageClient } from "@/components/tonight/TonightPageClient";

export const metadata: Metadata = {
  title: "Tonight in Vancouver — Find Your Perfect Night Out | YVR Advisory",
  description:
    "Not sure where to go tonight? Answer 4 quick questions and get personalized Vancouver nightlife recommendations — venues, events, and vibes matched to you.",
  keywords: [
    "where to go tonight Vancouver",
    "Vancouver tonight",
    "Vancouver nightlife recommendations",
    "what to do tonight Vancouver",
    "Vancouver club tonight",
    "Vancouver events tonight",
    "Vancouver nightlife advisor",
    "best night out Vancouver",
  ],
  alternates: { canonical: "/tonight" },
  openGraph: {
    type: "website",
    siteName: "YVR Advisory",
    title: "Tonight in Vancouver — Find Your Perfect Night Out | YVR Advisory",
    description: "Get personalized Vancouver nightlife recommendations in 4 questions. Venues, events, and vibes matched to you.",
    url: "/tonight",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "YVR Advisory — Tonight in Vancouver" }],
  },
};

export default function TonightPage() {
  return <TonightPageClient />;
}
