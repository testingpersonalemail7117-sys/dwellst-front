import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../../../components/layout/Navbar";
import Footer from "../../../../../components/layout/Footer";
import RequireAuth from "../../../../../components/auth/RequireAuth";
import ListingForm from "../../../../../components/listings/ListingForm";
import Alert from "../../../../../components/ui/Alert";
import { getListing } from "../../../../../lib/listings.server";
import { getListingMeta } from "../../../../../lib/listings";

export const metadata = { title: "Edit listing | roomSamar" };

// Login-only. The page checks ownership for a good message; the API enforces it again on save.
export default async function EditListingPage({ params }) {
  const { id } = await params;

  let meta = null;
  try {
    meta = await getListingMeta();
  } catch {
    /* shown below */
  }

  const listing = await getListing(id);
  if (!listing) notFound();

  return (
    <>
      <Navbar />
      <RequireAuth>
        <section className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold text-ink">Edit listing</h1>

          <div className="mt-6">
            {!listing.isOwner ? (
              <div className="space-y-3">
                <Alert variant="error">Only the owner of this listing can edit it.</Alert>
                <Link href={`/listings/${listing.id}`} className="text-sm font-semibold text-primary underline">
                  Back to the listing
                </Link>
              </div>
            ) : meta ? (
              <ListingForm meta={meta} listing={listing} />
            ) : (
              <Alert variant="error">The edit form couldn&apos;t be loaded. Please refresh the page to try again.</Alert>
            )}
          </div>
        </section>
      </RequireAuth>
      <Footer />
    </>
  );
}