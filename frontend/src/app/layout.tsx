import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { WebsiteJsonLd } from "@/components/layout/WebsiteJsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "YVR Advisory | Vancouver Nightlife & Events",
    template: "%s | YVR Advisory",
  },
  description:
    "YVR Advisory is Vancouver's nightlife advisor — curated nightclubs, cocktail bars, upcoming events, and personalized recommendations to help you find the best night out.",
  keywords: [
    "Vancouver nightlife",
    "nightclubs Vancouver",
    "events tonight Vancouver",
    "Vancouver clubs",
    "best bars Vancouver",
    "events Vancouver",
    "Granville Street nightlife",
    "Gastown bars Vancouver",
    "Yaletown lounges",
    "YVR nightlife guide",
    "Vancouver where to go tonight",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: "YVR Advisory",
    title: "YVR Advisory | Vancouver Nightlife & Events",
    description: "Your guide to Vancouver's finest nightlife.",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "YVR Advisory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YVR Advisory | Vancouver Nightlife & Events",
    description: "Your guide to Vancouver's finest nightlife.",
    images: ["/api/og"],
  },
  authors: [{ name: "YVR Advisory", url: SITE_URL }],
  creator: "YVR Advisory",
  publisher: "YVR Advisory",
  formatDetection: { telephone: false },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-background text-text-primary font-sans antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8V3HYJTMRZ"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-8V3HYJTMRZ');`}
        </Script>
        <WebsiteJsonLd />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
