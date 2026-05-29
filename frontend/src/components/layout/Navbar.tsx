"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const links = [
  { href: "/venues", label: "Venues" },
  { href: "/events", label: "Events" },
  { href: "/music", label: "Music" },
  { href: "/blog", label: "Journal" },
  { href: "/tonight", label: "Tonight" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-sm border-b border-white/5" : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <Link href="/" className="font-serif text-xl text-text-primary tracking-wide hover:text-gold transition-colors">
          YVR Advisory
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "text-xs uppercase tracking-widest transition-colors",
                  pathname === href ? "text-gold" : "text-text-muted hover:text-text-primary"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/guestlist"
            className="text-xs uppercase tracking-widest text-gold border border-gold/40 px-5 py-2 hover:bg-gold/10 transition-colors"
          >
            Guestlist
          </Link>
          <Link
            href="/reserve"
            className="text-xs uppercase tracking-widest bg-gold text-background px-5 py-2 hover:bg-gold-light transition-colors"
          >
            Reserve
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={clsx("block w-6 h-px bg-text-primary transition-all", menuOpen && "rotate-45 translate-y-2")} />
          <span className={clsx("block w-6 h-px bg-text-primary transition-all", menuOpen && "opacity-0")} />
          <span className={clsx("block w-6 h-px bg-text-primary transition-all", menuOpen && "-rotate-45 -translate-y-2")} />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/98 border-b border-white/5"
          >
            <ul className="px-6 py-6 flex flex-col gap-6">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-white/5 flex gap-3">
                <Link href="/guestlist" onClick={() => setMenuOpen(false)} className="text-xs uppercase tracking-widest text-gold border border-gold/40 px-4 py-2">
                  Guestlist
                </Link>
                <Link href="/reserve" onClick={() => setMenuOpen(false)} className="text-xs uppercase tracking-widest bg-gold text-background px-4 py-2">
                  Reserve
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
