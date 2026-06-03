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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-background/95 backdrop-blur-sm border-b border-white/5" : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <Link
            href="/"
            className="font-sans font-bold text-lg tracking-tight text-text-primary hover:text-gold transition-colors"
          >
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
              className="text-xs uppercase tracking-widest bg-gold text-background px-5 py-2 hover:bg-gold-light transition-colors font-semibold"
            >
              Reserve
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative z-[110] flex flex-col gap-[5px] p-2"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              className="block w-6 h-px bg-text-primary origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="block w-6 h-px bg-text-primary"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              className="block w-6 h-px bg-text-primary origin-center"
            />
          </button>
        </nav>
      </header>

      {/* Mobile menu — full panel */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-[90]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed top-0 right-0 h-full w-[82%] max-w-xs bg-[#0d0d0d] border-l border-white/[0.06] z-[100] flex flex-col px-8 pt-10 pb-10"
            >
              <div className="mb-10">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="font-sans font-bold text-xl text-text-primary"
                >
                  YVR Advisory
                </Link>
              </div>

              <ul className="flex flex-col flex-1">
                {links.map(({ href, label }, i) => (
                  <motion.li
                    key={href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={clsx(
                        "block py-4 font-sans text-xl font-light border-b border-white/[0.05] transition-colors",
                        pathname === href ? "text-gold" : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                className="flex flex-col gap-3 mt-8"
              >
                <Link
                  href="/guestlist"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs uppercase tracking-widest text-gold border border-gold/40 px-5 py-4 text-center hover:bg-gold/10 transition-colors"
                >
                  Join Guestlist
                </Link>
                <Link
                  href="/reserve"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs uppercase tracking-widest bg-gold text-background px-5 py-4 text-center font-semibold hover:bg-gold-light transition-colors"
                >
                  Reserve a Table
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
