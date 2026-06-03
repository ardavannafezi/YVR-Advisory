import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guestlist Signup | Skip the Line in Vancouver",
  description:
    "Sign up for the guestlist at Vancouver's top nightclubs and bars through YVR Advisory. Skip the line, avoid cover charges, and get exclusive access.",
  alternates: { canonical: "/guestlist" },
  openGraph: {
    title: "Guestlist Signup | YVR Advisory",
    description: "Skip the line at Vancouver's top venues — sign up for the guestlist.",
    url: "/guestlist",
    images: [{ url: "/api/og?title=Guestlist+Signup&subtitle=Skip+the+Line+in+Vancouver", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestlist Signup | YVR Advisory",
    description: "Skip the line at Vancouver's top venues — sign up for the guestlist.",
    images: ["/api/og?title=Guestlist+Signup&subtitle=Skip+the+Line+in+Vancouver"],
  },
};

export default function GuestlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
