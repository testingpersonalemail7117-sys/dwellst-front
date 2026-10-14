import { apiFetch, unwrap } from "./api";

// Converts an API listing into the shape the UI uses. Safe to import from client components.
export function normalizeListing(r) {
  const images = (r.images ?? []).map((img) => ({
    id: String(img.id),
    url: img.url,
    cardUrl: img.cardUrl ?? img.url,
    thumbUrl: img.thumbUrl ?? img.url,
    width: img.width ?? null,
    height: img.height ?? null,
  }));
  const cover = images[0];

  return {
    id: String(r.id),
    title: r.title ?? "",
    description: r.description ?? "",
    propertyType: r.propertyType ?? null,
    monthlyRent: Number(r.monthlyRent ?? 0),
    addressLine: r.addressLine ?? "",
    barangay: r.barangay ?? "",
    city: r.cityMunicipality ?? "",
    province: r.province ?? "",
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    bedrooms: r.bedrooms ?? null,
    bathrooms: r.bathrooms ?? null,
    availableUnits: r.availableUnits ?? null,
    amenities: r.amenities ?? [],
    status: r.availabilityStatus ?? "available",
    availableFrom: r.availableFrom ?? null,
    createdAt: r.createdAt ?? null,
    updatedAt: r.updatedAt ?? null,
    ownerName: r.owner?.name ?? "",
    isOwner: Boolean(r.isOwner),
    likeCount: r.likeCount ?? 0,
    commentCount: r.commentCount ?? 0,
    likedByMe: Boolean(r.likedByMe),
    images,
    image: cover ? { src: cover.cardUrl, alt: r.title ?? "" } : null,
    ogImage: r.ogImageUrl ?? null,
  };
}

// Newest available listings for the home page.
export async function getRecentListings(limit = 6) {
  // no-store: like and comment counts must be current. (A 60 second cache made them look stuck at 0.)
  const body = await apiFetch(`/listings?limit=${limit}&availability=available&sort=newest`, {
    cache: "no-store",
  });
  return (body?.data ?? []).map(normalizeListing);
}

// Search results page (GET /api/v1/listings with filters).
export async function searchListings(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
  }

  const body = await apiFetch(`/listings?${qs}`, { cache: "no-store" });
  return {
    listings: (body?.data ?? []).map(normalizeListing),
    pagination: body?.pagination ?? { page: 1, limit: 12, total: 0, totalPages: 1 },
  };
}

// Property types, amenities, availability statuses and upload limits (single source of truth: the API).
export async function getListingMeta() {
  const body = await apiFetch("/listings/meta", { next: { revalidate: 300 } });
  return unwrap(body);
}