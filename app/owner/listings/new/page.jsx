import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../../components/layout/Navbar";
import Footer from "../../../../components/layout/Footer";
import Gallery from "../../../../components/listings/Gallery";
import ListingEngagement from "../../../../components/listings/ListingEngagement";
import OwnerTools from "../../../../components/listings/OwnerTools";
import PriceDisplay from "../../../../components/listings/PriceDisplay";
import PropertyTypeBadge from "../../../../components/listings/PropertyTypeBadge";
import AvailabilityBadge from "../../../../components/listings/AvailabilityBadge";
import { getListing } from "../../../../lib/listings.server";
import { getListingMeta } from "../../../../lib/listings";
import { humanize, unitsLabel } from "../../../../lib/constants";
import { formatDate } from "../../../../lib/format";
import { peso } from "../../../../components/listings/PriceDisplay";

// Open Graph / Twitter tags: this is what chat apps and social sites show when a listing link is shared.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) return { title: "Listing not found | Dwellst" };

  const where = [listing.city, listing.province].filter(Boolean).join(", ");
  const summary = listing.description.replace(/\s+/g, " ").slice(0, 140);
  const description = `${peso(listing.monthlyRent)} / month in ${where}. ${summary}`.trim();
  const title = `${listing.title} | Dwellst`;
  const url = `/listings/${listing.id}`;
  const images = listing.ogImage ? [{ url: listing.ogImage, width: 1200, height: 630, alt: listing.title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Dwellst", type: "website", images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images: images?.map((i) => i.url) },
  };
}

const statusNotice = {
  occupied: "This place is currently rented or fully occupied.",
  unavailable: "The owner has temporarily closed this listing.",
};

export default async function ListingPage({ params }) {
  const { id } = await params;
  const [listing, meta] = await Promise.all([getListing(id), getListingMeta().catch(() => null)]);

  if (!listing) notFound();

  const amenityLabels = Object.fromEntries((meta?.amenities ?? []).map((a) => [a.value, a.label]));
  const location = [listing.addressLine, listing.barangay, listing.city, listing.province].filter(Boolean).join(", ");
  const posted = formatDate(listing.createdAt);
  const updated = formatDate(listing.updatedAt);

  const facts = [
    ["Bedrooms", listing.bedrooms],
    ["Bathrooms", listing.bathrooms],
    ["Availability", listing.availableUnits != null ? unitsLabel(listing.propertyType, listing.availableUnits) : null],
    ["Available from", listing.availableFrom ? formatDate(listing.availableFrom) : null],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/search" className="text-sm font-semibold text-primary underline hover:text-primary-hover">
          ← Back to search
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Gallery images={listing.images} title={listing.title} unavailable={listing.status !== "available"} />

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <PropertyTypeBadge type={listing.propertyType} />
              <AvailabilityBadge status={listing.status} availableFrom={listing.availableFrom} />
            </div>

            <h1 className="mt-3 text-2xl font-bold text-ink md:text-3xl">{listing.title}</h1>
            <p className="mt-1 text-muted">{location}</p>

            {statusNotice[listing.status] && (
              <p role="status" className="mt-4 rounded-lg border border-warning bg-surface px-4 py-3 text-sm font-medium text-warning">
                {statusNotice[listing.status]}
              </p>
            )}

            {facts.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-4">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-muted">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <section aria-labelledby="about-heading" className="mt-8">
              <h2 id="about-heading" className="text-xl font-bold text-ink">About this place</h2>
              {/* Rendered as plain text by React, so it is escaped. */}
              <p className="mt-3 whitespace-pre-line break-words text-ink">{listing.description}</p>
            </section>

            {listing.amenities.length > 0 && (
              <section aria-labelledby="amenities-heading" className="mt-8">
                <h2 id="amenities-heading" className="text-xl font-bold text-ink">Amenities</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <li key={a} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink">
                      {amenityLabels[a] ?? humanize(a)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {listing.latitude != null && listing.longitude != null && (
              <p className="mt-6">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary underline hover:text-primary-hover"
                >
                  View on map (opens in a new tab)
                </a>
              </p>
            )}

            <div className="mt-8">
              <ListingEngagement listing={listing} maxCommentLength={meta?.limits?.maxCommentLength ?? 1000} />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
              <PriceDisplay rent={listing.monthlyRent} />
              <p className="mt-3 text-sm text-ink">
                Posted by <span className="font-semibold">{listing.ownerName}</span>
              </p>
              {posted && <p className="text-xs text-muted">Posted {posted}</p>}
              {updated && updated !== posted && <p className="text-xs text-muted">Updated {updated}</p>}
              <p className="mt-3 text-xs text-muted">
                Details are provided by the owner. Visit the place and confirm everything before paying a deposit.
              </p>
            </div>

            {listing.isOwner && <OwnerTools listing={listing} statuses={meta?.availabilityStatuses ?? []} />}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}