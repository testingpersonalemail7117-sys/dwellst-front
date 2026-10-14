import { Suspense } from "react";
import Link from "next/link";
import { getRecentListings } from "../../lib/listings";
import ListingCard from "../listings/ListingCard";
import ListingsSkeleton from "../listings/ListingSkeleton";
import EmptyState from "../ui/EmptyState";
import Alert from "../ui/Alert";

// Loads from the API; handles the loading, empty and error states (documentation 22).
async function RecentListings() {
  let listings;
  try {
    listings = await getRecentListings(6);
  } catch {
    return <Alert variant="error">We couldn&apos;t load listings right now. Please refresh the page to try again.</Alert>;
  }

  if (listings.length === 0) {
    return <EmptyState title="No listings yet">New listings will appear here as owners publish them.</EmptyState>;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <li key={listing.id}>
          <ListingCard listing={listing} />
        </li>
      ))}
    </ul>
  );
}

export default function FeaturedRooms() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Recent listings</h2>
            <p className="mt-2 text-muted">The newest places available for long-term rent.</p>
          </div>
          <Link href="/search" className="shrink-0 text-sm font-semibold text-primary underline hover:text-primary-hover">
            View all
          </Link>
        </div>

        <div className="mt-6">
          <Suspense fallback={<ListingsSkeleton />}>
            <RecentListings />
          </Suspense>
        </div>
      </div>
    </section>
  );
}