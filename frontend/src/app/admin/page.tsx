"use client";

import Link from "next/link";

const sections = [
  {
    href: "/admin/analytics",
    title: "Analytics",
    description: "Sessions, guestlist signups, reservation stats.",
  },
  {
    href: "/admin/venues",
    title: "Venues",
    description: "Manage venue listings, music types, and tags.",
  },
  {
    href: "/admin/events",
    title: "Events",
    description: "Upcoming events, dates, and venue assignments.",
  },
  {
    href: "/admin/guestlist",
    title: "Guestlist",
    description: "View and export guestlist submissions.",
  },
  {
    href: "/admin/reservations",
    title: "Reservations",
    description: "Approve or reject table reservation requests.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-text-primary mb-2">Dashboard</h1>
        <div className="w-10 h-px bg-gold mb-4" />
        <p className="text-text-muted text-sm">Welcome back. Select a section to get started.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="card-surface p-6 group hover:border-gold/30 transition-colors duration-200 block"
          >
            <p className="font-serif text-xl text-text-primary group-hover:text-gold transition-colors mb-1">
              {title}
            </p>
            <p className="text-text-dim text-sm">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
