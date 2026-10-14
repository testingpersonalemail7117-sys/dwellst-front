import Link from "next/link";
import { btnOutline } from "../ui/style";

// Previous / next links that keep the current filters in the URL.
export default function Pagination({ page, totalPages, params }) {
  if (totalPages <= 1) return null;

  const href = (p) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) qs.set(key, value);
    if (p > 1) qs.set("page", String(p));
    const query = qs.toString();
    return query ? `/search?${query}` : "/search";
  };

  const disabled = `${btnOutline} pointer-events-none opacity-50`;

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} className={btnOutline} rel="prev">
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabled}>Previous</span>
      )}

      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={btnOutline} rel="next">
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={disabled}>Next</span>
      )}
    </nav>
  );
}