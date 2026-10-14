import Link from "next/link";
import Navbar from "../../../components/layout/Navbar";
import { btnPrimary } from "../../../components/ui/style";

export default function ListingNotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-ink">This listing isn&apos;t available</h1>
        <p className="mt-2 text-muted">It may have been removed by the owner, or the link is incorrect.</p>
        <Link href="/search" className={`${btnPrimary} mt-6`}>
          Search listings
        </Link>
      </main>
    </>
  );
}