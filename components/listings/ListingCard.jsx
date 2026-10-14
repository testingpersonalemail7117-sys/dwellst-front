import Link from "next/link";
import PriceDisplay from "./PriceDisplay";
import PropertyTypeBadge from "./PropertyTypeBadge";
import AvailabilityBadge from "./AvailabilityBadge";
import { unitsLabel } from "../../lib/constants";
import { formatDate } from "../../lib/format";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function ListingCard({ listing }) {
  const location = [listing.city, listing.province].filter(Boolean).join(", ");
  const unavailable = listing.status !== "available";

  const details = [
    listing.bedrooms != null && plural(listing.bedrooms, "bedroom"),
    listing.bathrooms != null && plural(listing.bathrooms, "bathroom"),
    listing.availableUnits != null && unitsLabel(listing.propertyType, listing.availableUnits),
    listing.amenities?.includes("furnished") ? "Furnished" : null,
  ].filter(Boolean);

  const updated = formatDate(listing.updatedAt);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-primary-light">
        {listing.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image.src}
            alt={listing.image.alt}
            loading="lazy"
            className={`h-full w-full object-cover ${unavailable ? "grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No photo yet</div>
        )}
        <div className="absolute left-3 top-3">
          <PropertyTypeBadge type={listing.propertyType} />
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-semibold text-ink group-hover:text-primary">{listing.title}</h3>
          {location && <p className="mt-1 text-sm text-muted">{location}</p>}
        </div>

        <PriceDisplay rent={listing.monthlyRent} />

        {details.length > 0 && <p className="text-sm text-muted">{details.join(" · ")}</p>}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <AvailabilityBadge status={listing.status} availableFrom={listing.availableFrom} />
          <p className="flex items-center gap-3 text-xs text-muted">
            <span>
              <span aria-hidden="true">♥</span> {listing.likeCount}
              <span className="sr-only"> likes</span>
            </span>
            <span>
              <span aria-hidden="true">💬</span> {listing.commentCount}
              <span className="sr-only"> comments</span>
            </span>
          </p>
        </div>

        {updated && <p className="text-xs text-muted">Updated {updated}</p>}
      </div>
    </Link>
  );
}