import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bottle Service & Table Reservations | Vancouver Nightlife",
  description:
    "Reserve a VIP table or bottle service at Vancouver's best nightclubs and lounges. Submit your request through YVR Advisory and get confirmed within 24 hours.",
  alternates: { canonical: "/reserve" },
  openGraph: {
    title: "Table Reservations | YVR Advisory",
    description: "Book bottle service and VIP tables at Vancouver's top venues.",
    url: "/reserve",
    images: [{ url: "/api/og?title=Table+Reservations&subtitle=VIP+Bottle+Service+in+Vancouver", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Table Reservations | YVR Advisory",
    description: "Book bottle service and VIP tables at Vancouver's top venues.",
    images: ["/api/og?title=Table+Reservations&subtitle=VIP+Bottle+Service+in+Vancouver"],
  },
};

export default function ReserveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
