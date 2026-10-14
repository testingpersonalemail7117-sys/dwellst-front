"use client";

import { useRef, useState } from "react";
import { apiFetch, errorMessage, unwrap } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { btnOutline } from "../ui/style";

// Optimistic like/unlike: the UI updates immediately and rolls back if the request fails.
// A ref blocks repeated taps while a request is in flight (the database also allows only one like per user).
export default function LikeButton({ listingId, initialLiked, initialCount }) {
  const { requireLogin } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState({ liked: initialLiked, count: initialCount });
  const pending = useRef(false);

  async function toggle() {
    if (pending.current) return;
    pending.current = true;

    const previous = state;
    setState({ liked: !previous.liked, count: Math.max(0, previous.count + (previous.liked ? -1 : 1)) });

    try {
      const result = unwrap(
        await apiFetch(`/listings/${listingId}/like`, { method: previous.liked ? "DELETE" : "POST" })
      );
      setState({ liked: result.liked, count: result.likeCount });
    } catch (err) {
      setState(previous);
      toast(errorMessage(err), "error");
    } finally {
      pending.current = false;
    }
  }

  return (
    <button
      type="button"
      onClick={() => requireLogin(toggle)}
      aria-pressed={state.liked}
      aria-label={`${state.liked ? "Unlike" : "Like"} this listing (${state.count} ${state.count === 1 ? "like" : "likes"})`}
      className={`${btnOutline} gap-2 ${state.liked ? "border-primary text-primary" : ""}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={state.liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span aria-hidden="true">{state.count}</span>
    </button>
  );
}