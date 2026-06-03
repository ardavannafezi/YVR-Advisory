import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#3a1f6a]/25 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center mb-4">
            <Image src="/gold.png" alt="YVR Advisory" width={140} height={40} className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-text-muted text-sm leading-relaxed max-w-xs mt-2">
            Vancouver&apos;s independent nightlife guide — curated venues, upcoming events, and honest advice. No affiliations, no commissions.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-dim hover:text-gold transition-colors text-xs uppercase tracking-widest">
              Instagram
            </a>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-5">Explore</p>
          <ul className="flex flex-col gap-3">
            {[
              { href: "/venues", label: "Venues" },
              { href: "/events", label: "Events" },
              { href: "/music", label: "Music" },
              { href: "/blog", label: "Journal" },
              { href: "/tonight", label: "Where to Go Tonight" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-text-muted text-sm hover:text-text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-5">Access</p>
          <ul className="flex flex-col gap-3">
            {[
              { href: "/guestlist", label: "Join Guestlist" },
              { href: "/reserve", label: "Reserve a Table" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-text-muted text-sm hover:text-text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#3a1f6a]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-text-dim text-[11px] leading-relaxed text-center">
            Venue information, hours, pricing, and event details are provided for general guidance only and may not reflect current conditions.
            YVR Advisory is not responsible for inaccurate, incomplete, or outdated information. Always confirm details directly with the venue before visiting.
          </p>
        </div>
      </div>

      <div className="border-t border-[#3a1f6a]/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-text-dim text-xs">© {year} YVR Advisory. All rights reserved.</p>
          <p className="text-text-dim text-xs">Vancouver, BC</p>
        </div>
      </div>
    </footer>
  );
}
