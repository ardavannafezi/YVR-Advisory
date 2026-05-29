"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, clearToken } from "@/lib/auth";
import clsx from "clsx";

const adminLinks = [
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/guestlist", label: "Guestlist" },
  { href: "/admin/reservations", label: "Reservations" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") { setChecked(true); return; }
    if (!isAuthenticated()) { router.replace("/admin/login"); return; }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) return null;
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-56 shrink-0 border-r border-white/5 pt-8 flex flex-col">
        <div className="px-6 mb-8">
          <p className="font-serif text-lg text-text-primary">YVR Admin</p>
        </div>
        <nav className="flex-1 px-3">
          {adminLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "block px-3 py-2.5 text-sm rounded-sm mb-1 transition-colors",
                pathname === href ? "bg-gold/10 text-gold" : "text-text-muted hover:text-text-primary hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-6 pb-8">
          <button
            onClick={() => { clearToken(); router.push("/admin/login"); }}
            className="text-xs uppercase tracking-widest text-text-dim hover:text-gold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
