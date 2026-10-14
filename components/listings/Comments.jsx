"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiFetch, errorMessage, unwrap } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatDateTime } from "../../lib/format";
import Alert from "../ui/Alert";
import EmptyState from "../ui/EmptyState";
import ConfirmDialog from "../ui/ConfirmDialog";
import { btnOutline, btnPrimary } from "../ui/style";

const PAGE_SIZE = 10;
const smallButton =
  "inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold text-muted hover:bg-primary-light hover:text-ink";
const textarea =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary";

// How many visible (not hidden) comments a thread contributes to the total.
const visibleIn = (top) => (top.hidden ? 0 : 1) + top.replies.filter((r) => !r.hidden).length;
const withReplies = (c) => ({ ...c, replies: c.replies ?? [] });

// One comment section for the whole listing, with one level of replies.
//   - anyone signed in can comment or reply (the owner's replies get an "Owner" badge)
//   - only the author can edit or delete their own comment
//   - only the listing owner can hide or show a comment (hidden text is not sent to other people)
// Comment text is rendered as plain text by React, so any markup typed by a user is escaped.
export default function Comments({ listingId, maxLength = 1000, onTotalChange }) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const totalRef = useRef(0);
  const [cursor, setCursor] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const postingRef = useRef(false);

  const [replyTo, setReplyTo] = useState(null); // { parentId, name }
  const [replyDraft, setReplyDraft] = useState("");
  const [replying, setReplying] = useState(false);
  const replyingRef = useRef(false);

  const [editing, setEditing] = useState(null); // { id, text, saving }
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setTotalValue = useCallback(
    (n) => {
      totalRef.current = n;
      setTotal(n);
      onTotalChange?.(n);
    },
    [onTotalChange]
  );
  const adjustTotal = (delta) => setTotalValue(Math.max(0, totalRef.current + delta));

  // Load the first page once the session is known, so "mine" and "canHide" are correct.
  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setStatus("loading");

    apiFetch(`/listings/${listingId}/comments?limit=${PAGE_SIZE}`)
      .then((body) => {
        if (!active) return;
        setItems((body.data ?? []).map(withReplies));
        setCursor(body.pagination?.nextCursor ?? null);
        setTotalValue(body.pagination?.total ?? 0);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));

    return () => {
      active = false;
    };
  }, [authLoading, user?.id, listingId, reloadKey, setTotalValue]);

  // Replace one comment or reply with fresh data from the server (keeps the thread's replies).
  const patchComment = (id, updated) =>
    setItems((prev) =>
      prev.map((top) =>
        top.id === id
          ? { ...top, ...updated, replies: top.replies }
          : { ...top, replies: top.replies.map((r) => (r.id === id ? { ...r, ...updated } : r)) }
      )
    );

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const body = await apiFetch(`/listings/${listingId}/comments?limit=${PAGE_SIZE}&before=${cursor}`);
      setItems((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        return [...prev, ...(body.data ?? []).filter((c) => !seen.has(c.id)).map(withReplies)];
      });
      setCursor(body.pagination?.nextCursor ?? null);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setLoadingMore(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || postingRef.current) return;

    postingRef.current = true;
    setPosting(true);
    try {
      const comment = unwrap(await apiFetch(`/listings/${listingId}/comments`, { method: "POST", body: { body: text } }));
      setItems((prev) => [withReplies(comment), ...prev]);
      setDraft("");
      adjustTotal(1);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      postingRef.current = false;
      setPosting(false);
    }
  }

  async function submitReply(e) {
    e.preventDefault();
    const text = replyDraft.trim();
    if (!text || !replyTo || replyingRef.current) return;

    replyingRef.current = true;
    setReplying(true);
    try {
      const reply = unwrap(
        await apiFetch(`/listings/${listingId}/comments`, { method: "POST", body: { body: text, parentId: replyTo.parentId } })
      );
      // The server attaches replies to the thread's top-level comment.
      setItems((prev) => prev.map((top) => (top.id === reply.parentId ? { ...top, replies: [...top.replies, reply] } : top)));
      setReplyTo(null);
      setReplyDraft("");
      adjustTotal(1);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      replyingRef.current = false;
      setReplying(false);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    const text = editing.text.trim();
    if (!text || editing.saving) return;

    setEditing((s) => ({ ...s, saving: true }));
    try {
      const updated = unwrap(await apiFetch(`/comments/${editing.id}`, { method: "PATCH", body: { body: text } }));
      patchComment(updated.id, updated);
      setEditing(null);
      toast("Comment updated", "success");
    } catch (err) {
      setEditing((s) => ({ ...s, saving: false }));
      toast(errorMessage(err), "error");
    }
  }

  async function toggleHidden(c) {
    try {
      const updated = unwrap(await apiFetch(`/comments/${c.id}/visibility`, { method: "PATCH", body: { hidden: !c.hidden } }));
      patchComment(updated.id, updated);
      adjustTotal(updated.hidden ? -1 : 1);
      toast(updated.hidden ? "Comment hidden from other people" : "Comment is visible again", "success");
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await apiFetch(`/comments/${toDelete.id}`, { method: "DELETE" });

      if (toDelete.parentId) {
        setItems((prev) => prev.map((top) => ({ ...top, replies: top.replies.filter((r) => r.id !== toDelete.id) })));
        adjustTotal(toDelete.hidden ? 0 : -1);
      } else {
        const thread = items.find((t) => t.id === toDelete.id);
        setItems((prev) => prev.filter((t) => t.id !== toDelete.id));
        adjustTotal(-(thread ? visibleIn(thread) : 1));
      }

      setToDelete(null);
      toast("Comment deleted", "success");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  }

  // One comment or reply.
  function renderComment(c) {
    const isEditing = editing?.id === c.id;
    const edited = c.updatedAt && c.updatedAt !== c.createdAt;
    const placeholder = c.hidden && c.body === null;

    return (
      <div className="flex gap-3">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary"
        >
          {(c.author?.name || "?").trim().charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-semibold text-ink">{c.author?.name}</span>
            {c.author?.isListingOwner && (
              <span className="ml-2 rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">Owner</span>
            )}{" "}
            <span className="text-xs text-muted">
              {formatDateTime(c.createdAt)}
              {edited ? " · edited" : ""}
            </span>
          </p>

          {isEditing ? (
            <form onSubmit={saveEdit} className="mt-2">
              <label htmlFor={`edit-${c.id}`} className="sr-only">
                Edit your comment
              </label>
              <textarea
                id={`edit-${c.id}`}
                value={editing.text}
                onChange={(e) => setEditing((s) => ({ ...s, text: e.target.value }))}
                maxLength={maxLength}
                rows={3}
                className={textarea}
              />
              <div className="mt-2 flex gap-2">
                <button type="submit" disabled={editing.saving || !editing.text.trim()} className={btnPrimary}>
                  {editing.saving ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setEditing(null)} disabled={editing.saving} className={btnOutline}>
                  Cancel
                </button>
              </div>
            </form>
          ) : placeholder ? (
            <p className="mt-1 text-sm italic text-muted">This comment was hidden by the listing owner.</p>
          ) : (
            <>
              {c.hidden && (
                <p className="mt-1 text-xs font-semibold text-warning">
                  {c.canHide ? "Hidden from other people" : "Hidden by the listing owner. Only you and the owner can see this."}
                </p>
              )}
              <p className={`mt-1 whitespace-pre-wrap break-words text-sm ${c.hidden ? "text-muted" : "text-ink"}`}>{c.body}</p>
            </>
          )}

          {!isEditing && (
            <div className="mt-1 flex flex-wrap gap-1">
              {user && !c.hidden && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo({ parentId: c.id, name: c.author?.name });
                    setReplyDraft("");
                  }}
                  className={smallButton}
                >
                  Reply
                  <span className="sr-only"> to {c.author?.name}</span>
                </button>
              )}
              {c.mine && !placeholder && (
                <button type="button" onClick={() => setEditing({ id: c.id, text: c.body, saving: false })} className={smallButton}>
                  Edit
                </button>
              )}
              {c.mine && (
                <button type="button" onClick={() => setToDelete(c)} className={smallButton}>
                  Delete
                </button>
              )}
              {c.canHide && (
                <button type="button" onClick={() => toggleHidden(c)} className={smallButton}>
                  {c.hidden ? "Show again" : "Hide"}
                  <span className="sr-only"> this comment</span>
                </button>
              )}
            </div>
          )}

          {replyTo?.parentId === c.id && (
            <form onSubmit={submitReply} className="mt-2">
              <label htmlFor={`reply-${c.id}`} className="sr-only">
                Write a reply to {replyTo.name}
              </label>
              <textarea
                id={`reply-${c.id}`}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                maxLength={maxLength}
                rows={2}
                autoFocus
                placeholder={`Reply to ${replyTo.name}`}
                className={textarea}
              />
              <div className="mt-2 flex gap-2">
                <button type="submit" disabled={replying || !replyDraft.trim()} className={btnPrimary}>
                  {replying ? "Posting…" : "Post reply"}
                </button>
                <button type="button" onClick={() => setReplyTo(null)} disabled={replying} className={btnOutline}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <section id="comments" aria-labelledby="comments-heading" className="mt-8 scroll-mt-24">
      <h2 id="comments-heading" className="text-xl font-bold text-ink">
        Comments ({total})
      </h2>

      {user ? (
        <form onSubmit={submit} className="mt-4">
          <label htmlFor="new-comment" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="new-comment"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={maxLength}
            rows={3}
            placeholder="Ask the owner a question or leave a comment"
            className={textarea}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-muted">
              {draft.length} / {maxLength}
            </p>
            <button type="submit" disabled={posting || draft.trim().length === 0} className={btnPrimary}>
              {posting ? "Posting…" : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        !authLoading && (
          <p className="mt-3 text-sm text-muted">
            <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-semibold text-primary underline hover:text-primary-hover">
              Log in
            </Link>{" "}
            to comment or reply.
          </p>
        )
      )}

      <div className="mt-6">
        {status === "loading" && (
          <div aria-busy="true" className="space-y-4">
            <span className="sr-only">Loading comments…</span>
            {[0, 1].map((i) => (
              <div key={i} className="flex animate-pulse gap-3">
                <div className="h-10 w-10 rounded-full bg-line" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/4 rounded bg-line" />
                  <div className="h-3 w-3/4 rounded bg-line" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <Alert variant="error">Comments couldn&apos;t be loaded.</Alert>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={btnOutline}>
              Try again
            </button>
          </div>
        )}

        {status === "ready" && items.length === 0 && (
          <EmptyState title="No comments yet">Be the first to ask a question about this place.</EmptyState>
        )}

        {status === "ready" && items.length > 0 && (
          <ul className="space-y-6">
            {items.map((top) => (
              <li key={top.id}>
                {renderComment(top)}

                {top.replies.length > 0 && (
                  <ul aria-label={`Replies to ${top.author?.name}`} className="ml-5 mt-4 space-y-4 border-l-2 border-line pl-4 sm:ml-13">
                    {top.replies.map((reply) => (
                      <li key={reply.id}>{renderComment(reply)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}

        {status === "ready" && cursor && (
          <div className="mt-6 text-center">
            <button type="button" onClick={loadMore} disabled={loadingMore} className={btnOutline}>
              {loadingMore ? "Loading…" : "Load more comments"}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this comment?"
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        {toDelete && !toDelete.parentId
          ? "This also deletes all replies to it. This can't be undone."
          : "This can't be undone."}
      </ConfirmDialog>
    </section>
  );
}