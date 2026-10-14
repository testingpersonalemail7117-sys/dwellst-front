import Link from "next/link";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/search", label: "Search listings" },
      { href: "/owner/listings/new", label: "Post a room" },
      { href: "/owner/listings", label: "My listings" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Sign up" },
      { href: "/forgot-password", label: "Forgot password" },
    ],
  },
  {
    title: "Help & legal",
    links: [
      { href: "/help", label: "Help" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="text-xl font-bold text-primary">Dwellio</p>
          <p className="mt-3 max-w-xs text-sm text-muted">Long-term room and home rentals across the Philippines.</p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold text-ink">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-primary hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Dwellio. All rights reserved.
      </div>
    </footer>
  );
}