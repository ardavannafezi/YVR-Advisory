import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl text-text-primary mb-3">YVR Advisory</p>
          <p className="text-text-muted text-sm leading-relaxed max-w-xs">
            Your guide to Vancouver&apos;s finest nightlife experiences. Personalized recommendations, curated events, and exclusive access.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-dim hover:text-gold transition-colors text-xs uppercase tracking-widest">
              Instagram
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-5">Explore</p>
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
          <p className="text-xs uppercase tracking-widest text-gold mb-5">Access</p>
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

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-text-dim text-xs">© {year} YVR Advisory. All rights reserved.</p>
          <p className="text-text-dim text-xs">Vancouver, BC</p>
        </div>
      </div>
    </footer>
  );
}
