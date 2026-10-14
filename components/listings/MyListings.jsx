"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, errorMessage } from "../../lib/api";
import { normalizeListing } from "../../lib/listings";
import { useToast } from "../../context/ToastContext";
import ListingCard from "./ListingCard";
import ListingsSkeleton from "./ListingSkeleton";
import EmptyState from "../ui/EmptyState";
import Alert from "../ui/Alert";
import ConfirmDialog from "../ui/ConfirmDialog";
import { btnDanger, btnOutline, btnPrimary } from "../ui/style";

// The signed-in owner's listings (all availability statuses), with edit and delete.
export default function MyListings() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPage = useCallback(async (p) => {
    const body = await apiFetch(`/listings/mine?page=${p}&limit=12`);
    return { listings: (body?.data ?? []).map(normalizeListing), totalPages: body?.pagination?.totalPages ?? 1 };
  }, []);

  useEffect(() => {
    let active = true;
    fetchPage(1)
      .then((r) => {
        if (!active) return;
        setItems(r.listings);
        setTotalPages(r.totalPages);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [fetchPage]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const r = await fetchPage(next);
      setItems((prev) => {
        const seen = new Set(prev.map((l) => l.id));
        return [...prev, ...r.listings.filter((l) => !seen.has(l.id))];
      });
      setPage(next);
      setTotalPages(r.totalPages);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setLoadingMore(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await apiFetch(`/listings/${toDelete.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((l) => l.id !== toDelete.id));
      setToDelete(null);
      toast("Listing deleted", "success");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">My listings</h1>
        <Link href="/owner/listings/new" className={btnPrimary}>
          Post a room
        </Link>
      </div>

      <div className="mt-6">
        {status === "loading" && <ListingsSkeleton />}

        {status === "error" && <Alert variant="error">We couldn&apos;t load your listings. Please refresh the page to try again.</Alert>}

        {status === "ready" && items.length === 0 && (
          <EmptyState title="You haven't posted any rooms yet">
            <p>Post your first listing so renters can find it.</p>
            <Link href="/owner/listings/new" className={`${btnPrimary} mt-4`}>
              Post a room
            </Link>
          </EmptyState>
        )}

        {status === "ready" && items.length > 0 && (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Link href={`/owner/listings/${listing.id}/edit`} className={btnOutline}>
                      Edit
                    </Link>
                    <button type="button" onClick={() => setToDelete(listing)} className={btnDanger}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {page < totalPages && (
              <div className="mt-8 text-center">
                <button type="button" onClick={loadMore} disabled={loadingMore} className={btnOutline}>
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this listing?"
        confirmLabel="Delete listing"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        {toDelete ? `“${toDelete.title}” and its photos, likes and comments will be permanently removed.` : ""}
      </ConfirmDialog>
    </section>
  );
}