import Link from "next/link";
import { PROPERTY_TYPES } from "../../lib/constants";

// Property-type shortcuts (documentation 6.1, item 4).
export default function CategorySection() {
  return (
    <section id="property-types" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
      <h2 className="text-2xl font-bold text-ink">Browse by property type</h2>
      <p className="mt-2 text-muted">Pick the kind of place that fits your budget and how you like to live.</p>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {PROPERTY_TYPES.map((t) => (
          <li key={t.value}>
            <Link
              href={`/search?type=${t.value}`}
              className="group flex h-full flex-col items-center rounded-xl border border-line bg-surface p-4 text-center shadow-sm transition-colors hover:border-primary hover:bg-primary-light"
            >
              <span className="text-3xl" aria-hidden="true">{t.icon}</span>
              <span className="mt-3 text-sm font-semibold text-ink group-hover:text-primary">{t.label}</span>
              <span className="mt-1 text-xs text-muted">{t.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}