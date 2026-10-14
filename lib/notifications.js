import { formatVisitRange } from "./format";

// Turns a stored notification into the text and link the UI shows.
// The server only stores the type and the facts (listing title, visitor name, times), never the wording.
export function describeNotification(n) {
  const d = n.data ?? {};
  const what = d.listingTitle || "a listing";
  const when = d.startsAt && d.endsAt ? formatVisitRange(d.startsAt, d.endsAt) : "";
  const detail = [what, when].filter(Boolean).join(" · ");
  const visitor = d.visitorName || "Someone";

  // The listing page has the owner's visit list (#visits). No link if the listing was deleted.
  const listing = n.listingId ? `/listings/${n.listingId}` : null;
  const ownerLink = listing ? `${listing}#visits` : null;

  switch (n.type) {
    case "visit_booked":
      return { title: `${visitor} booked a visit`, body: d.note ? `${detail}. Note: "${d.note}"` : detail, href: ownerLink };

    case "visit_scheduled":
      return { title: "Your visit is scheduled", body: detail, href: "/visits" };

    case "visit_cancelled_by_visitor":
      return { title: `${visitor} cancelled their visit`, body: `${detail}. The time is open for others again.`, href: ownerLink };

    case "visit_cancelled_by_owner":
      return d.reason === "listing_removed"
        ? { title: "A place you planned to visit was removed", body: `${detail}. Your visit was cancelled.`, href: "/visits" }
        : { title: "The owner cancelled your visit", body: `${detail}. You can book another time.`, href: listing ?? "/visits" };

    case "visit_attended":
      return { title: "Your visit was marked as attended", body: detail, href: "/visits" };

    case "visit_not_attended":
      return { title: "Your visit was marked as not attended", body: `${detail}. You can book another time.`, href: listing ?? "/visits" };

    case "visit_released":
      return {
        title: "Your visit was released",
        body: `${detail}. Nobody confirmed it, so the time was opened for others. You can book again.`,
        href: listing ?? "/visits",
      };

    case "visit_released_owner":
      return {
        title: `${visitor}'s visit was released as not attended`,
        body: `${detail}. If they did come, you can correct it for a few days.`,
        href: ownerLink,
      };

    default:
      return { title: "New update", body: "", href: "/notifications" };
  }
}