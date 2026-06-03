import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Where to Go Tonight | Vancouver Nightlife Quiz",
  description:
    "Not sure where to go tonight in Vancouver? Answer 3 quick questions and get a personalized nightlife recommendation — clubs, bars, and events matched to your vibe.",
  alternates: { canonical: "/tonight" },
  openGraph: {
    title: "Where to Go Tonight | YVR Advisory",
    description: "Get a personalized Vancouver nightlife recommendation in seconds.",
    url: "/tonight",
    images: [{ url: "/api/og?title=Where+to+Go+Tonight&subtitle=Personalized+Vancouver+Nightlife+Picks", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where to Go Tonight | YVR Advisory",
    description: "Get a personalized Vancouver nightlife recommendation in seconds.",
    images: ["/api/og?title=Where+to+Go+Tonight&subtitle=Personalized+Vancouver+Nightlife+Picks"],
  },
};

export default function TonightLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
