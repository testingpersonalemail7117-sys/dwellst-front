"use client";

import { useToast } from "../../context/ToastContext";
import { btnOutline } from "../ui/style";
import { peso } from "./PriceDisplay";

// Web Share API where available, otherwise copies the public listing URL to the clipboard.
export default function ShareButton({ listingId, title, monthlyRent }) {
  const { toast } = useToast();

  async function copyLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to your clipboard", "success");
    } catch {
      toast("Sharing isn't available in this browser. Copy the link from the address bar instead.", "error");
    }
  }

  async function share() {
    const url = `${window.location.origin}/listings/${listingId}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: `${title} - ${peso(monthlyRent)} / month`, url });
      } catch (err) {
        // Closing the share sheet is not an error. Anything else falls back to copying.
        if (err?.name !== "AbortError") await copyLink(url);
      }
      return;
    }

    await copyLink(url);
  }

  return (
    <button type="button" onClick={share} className={`${btnOutline} gap-2`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
      </svg>
      Share
    </button>
  );
}