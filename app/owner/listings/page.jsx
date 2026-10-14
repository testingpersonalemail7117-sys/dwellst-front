import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import RequireAuth from "../../../components/auth/RequireAuth";
import ListingForm from "../../../components/listings/ListingForm";
import Alert from "../../../components/ui/Alert";
import { getListingMeta } from "../../../lib/listings";

export const metadata = { title: "Post a room | Dwellst" };

// Login-only: logged-out visitors are redirected to /login?next=/owner/listings/new
export default async function NewListingPage() {
  let meta = null;
  let loadError = "";

  try {
    meta = await getListingMeta();
    if (!meta?.limits || !meta?.propertyTypes) {
      throw new Error("The /listings/meta response is missing 'limits' or 'propertyTypes'");
    }
  } catch (err) {
    meta = null;
    loadError = err?.cause?.code ? `${err.message} (${err.cause.code})` : err?.message || String(err);
    console.error("[new listing page] could not load /api/v1/listings/meta:", err);
  }

  return (
    <>
      <Navbar />
      <RequireAuth>
        <section className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold text-ink">Post a room</h1>
          <p className="mt-2 text-muted">Tell renters about your place. You can edit or close the listing any time.</p>

          <div className="mt-6">
            {meta ? (
              <ListingForm meta={meta} />
            ) : (
              <div className="space-y-3">
                <Alert variant="error">The posting form couldn&apos;t be loaded. Please refresh the page to try again.</Alert>
                {process.env.NODE_ENV !== "production" && (
                  <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-3 text-xs text-ink">
                    {`Reason: ${loadError}\nBackend URL used: ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000 (BACKEND_URL is not set)"}`}
                  </pre>
                )}
              </div>
            )}
          </div>
        </section>
      </RequireAuth>
      <Footer />
    </>
  );
}