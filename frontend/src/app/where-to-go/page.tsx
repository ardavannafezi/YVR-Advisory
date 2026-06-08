import type { Metadata } from "next";
import { WhereToGoClient } from "@/components/tonight/WhereToGoClient";

export const metadata: Metadata = {
  title: "Where to Go Tonight — Vancouver Nightlife | YVR Advisory",
  description:
    "Answer a few questions and get personalized Vancouver nightlife recommendations. The best clubs, bars, and events matched to your vibe.",
  keywords: [
    "where to go tonight Vancouver",
    "Vancouver nightlife quiz",
    "personalized nightlife recommendations",
    "best clubs tonight Vancouver",
    "Vancouver nightlife finder",
    "what to do tonight Vancouver",
  ],
  alternates: { canonical: "/where-to-go" },
  openGraph: {
    type: "website",
    siteName: "YVR Advisory",
    title: "Where to Go Tonight — Vancouver Nightlife | YVR Advisory",
    description: "Get personalized Vancouver nightlife recommendations. Best clubs, bars, and events matched to your vibe.",
    url: "/where-to-go",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Where to Go Tonight — YVR Advisory" }],
  },
};

export default function WhereToGoPage() {
  return <WhereToGoClient />;
}
