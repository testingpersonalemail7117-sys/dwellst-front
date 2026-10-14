import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ListingCard from "../../components/listings/ListingCard";
import SearchFilters from "../../components/search/SearchFilters";
import Pagination from "../../components/search/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import { btnOutline } from "../../components/ui/style";
import { searchListings } from "../../lib/listings";
import { errorMessage } from "../../lib/api";

export const metadata = {
  title: "Search listings | Dwellst",
  description: "Search rooms, bedspaces, boardinghouses, apartments and houses for long-term rent in the Philippines.",
};

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;

  const filters = {
    city: first(sp.city),
    type: first(sp.type),
    minRent: first(sp.minRent),
    maxRent: first(sp.maxRent),
    availability: first(sp.availability),
    sort: first(sp.sort),
  };

  let result = null;
  let error = "";

  try {
    result = await searchListings({ ...filters, page: first(sp.page), limit: 12 });
  } catch (err) {
    error = err.status === 400 ? errorMessage(err) : "We couldn't load listings right now. Please try again in a moment.";
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink">Search listings</h1>

        <div className="mt-4">
          <SearchFilters values={filters} />
        </div>

        <div className="mt-6">
          {error && <Alert variant="error">{error}</Alert>}

          {result && (
            <>
              <p aria-live="polite" className="mb-4 text-sm text-muted">
                {result.pagination.total} {result.pagination.total === 1 ? "listing" : "listings"} found
              </p>

              {result.listings.length === 0 ? (
                <EmptyState title="No listings match your search">
                  <p>Try a different location, a wider price range, or remove some filters.</p>
                  <Link href="/search" className={`${btnOutline} mt-4`}>
                    Clear filters
                  </Link>
                </EmptyState>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {result.listings.map((listing) => (
                    <li key={listing.id}>
                      <ListingCard listing={listing} />
                    </li>
                  ))}
                </ul>
              )}

              <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} params={filters} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}