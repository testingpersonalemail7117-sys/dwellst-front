import Navbar from "../../components/layout/Navbar";
import ListingsSkeleton from "../../components/listings/ListingSkeleton";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink">Search listings</h1>
        <div className="mt-6">
          <ListingsSkeleton count={6} />
        </div>
      </main>
    </>
  );
}