"use client";

import { useState } from "react";
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import Comments from "./Comments";
import { btnOutline } from "../ui/style";

// Like, comment count and share controls, with the single comment section beneath them.
export default function ListingEngagement({ listing, maxCommentLength }) {
  const [commentCount, setCommentCount] = useState(listing.commentCount);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-y border-line py-3">
        <LikeButton listingId={listing.id} initialLiked={listing.likedByMe} initialCount={listing.likeCount} />
        <a href="#comments" className={`${btnOutline} gap-2`}>
          <span aria-hidden="true">💬</span>
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </a>
        <ShareButton listingId={listing.id} title={listing.title} monthlyRent={listing.monthlyRent} />
      </div>

      <Comments listingId={listing.id} maxLength={maxCommentLength} onTotalChange={setCommentCount} />
    </div>
  );
}