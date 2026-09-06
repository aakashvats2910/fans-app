"use client";

import Link from "next/link";
import { mediaUrl } from "@/lib/api";
import { CreatorProfile } from "@/lib/types";
import Avatar from "./Avatar";

export default function CreatorCard({ creator }: { creator: CreatorProfile }) {
  const cover = mediaUrl(creator.coverImageUrl);
  return (
    <Link
      href={`/creators/${creator.username}`}
      className="block rounded-2xl border border-border bg-surface overflow-hidden hover:border-brand/60 transition-colors"
    >
      <div
        className="h-24 bg-gradient-to-br from-brand/40 to-brand-2/40"
        style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />
      <div className="p-4 -mt-8">
        <Avatar src={creator.avatarUrl} name={creator.displayName} size={56} />
        <p className="font-semibold mt-2 flex items-center gap-1">
          {creator.displayName}
          {creator.verified && <span className="text-brand text-xs">✓</span>}
        </p>
        <p className="text-xs text-muted">@{creator.username}</p>
        {creator.bio && <p className="text-xs text-muted mt-2 line-clamp-2">{creator.bio}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted">{creator.subscriberCount} subscribers</span>
          <span className="text-sm font-semibold">${creator.subscriptionPrice.toFixed(2)}/mo</span>
        </div>
      </div>
    </Link>
  );
}
