"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import UploadPostForm from "@/components/UploadPostForm";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";
import { PageResponse, Post, Subscription } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

function StudioContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [subscribers, setSubscribers] = useState<Subscription[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [postsRes, subsRes, earningsRes] = await Promise.all([
      api.get<PageResponse<Post>>(`/api/posts/creator/${user.username}`, { params: { size: 30 } }),
      api.get<Subscription[]>("/api/subscriptions/subscribers"),
      api.get<{ total: number }>("/api/payments/earnings/total"),
    ]);
    setPosts(postsRes.data.content);
    setSubscribers(subsRes.data);
    setTotalEarnings(earningsRes.data.total);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-bold">Creator studio</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted mb-1">Total earnings (simulated)</p>
          <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted mb-1">Active subscribers</p>
          <p className="text-2xl font-bold">{subscribers.length}</p>
        </div>
      </div>

      <UploadPostForm onCreated={(post) => setPosts((p) => [post, ...p])} />

      <div>
        <h2 className="font-semibold mb-4">Your posts</h2>
        {loading && <p className="text-sm text-muted">Loading...</p>}
        {!loading && posts.length === 0 && (
          <p className="text-sm text-muted">You haven&apos;t posted anything yet.</p>
        )}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <RequireAuth role="CREATOR">
      <StudioContent />
    </RequireAuth>
  );
}
