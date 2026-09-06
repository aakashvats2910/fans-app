"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";
import { PageResponse, Post } from "@/lib/types";

function FeedContent() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PageResponse<Post>>("/api/posts/feed", { params: { size: 20 } })
      .then((res) => setPosts(res.data.content))
      .catch(() => setError("Could not load your feed"));
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-bold">Your feed</h1>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {posts === null && !error && (
        <p className="text-sm text-muted text-center py-12">Loading feed...</p>
      )}
      {posts && posts.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-border bg-surface">
          <p className="font-semibold mb-1">Your feed is empty</p>
          <p className="text-sm text-muted mb-4">
            Subscribe to creators to see their posts here.
          </p>
          <Link
            href="/explore"
            className="inline-block px-5 py-2 rounded-full brand-gradient text-white text-sm font-semibold"
          >
            Explore creators
          </Link>
        </div>
      )}
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default function FeedPage() {
  return (
    <RequireAuth>
      <FeedContent />
    </RequireAuth>
  );
}
