"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, mediaUrl, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CreatorProfile, PageResponse, Post } from "@/lib/types";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import PaymentModal from "@/components/PaymentModal";

export default function CreatorProfilePage(props: PageProps<"/creators/[username]">) {
  const { username } = use(props.params);
  const { user } = useAuth();
  const router = useRouter();

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const load = async () => {
    try {
      const [creatorRes, postsRes] = await Promise.all([
        api.get<CreatorProfile>(`/api/creators/${username}`),
        api.get<PageResponse<Post>>(`/api/posts/creator/${username}`, { params: { size: 20 } }),
      ]);
      setCreator(creatorRes.data);
      setPosts(postsRes.data.content);
    } catch (err) {
      setError(extractErrorMessage(err, "Creator not found"));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const subscribe = async () => {
    if (!creator) return;
    await api.post(`/api/subscriptions/${creator.userId}`);
    setShowSubscribe(false);
    await load();
  };

  const toggleFollow = async () => {
    if (!creator || !user) {
      router.push("/login");
      return;
    }
    setFollowBusy(true);
    try {
      if (creator.isFollowing) {
        await api.delete(`/api/follows/${creator.userId}`);
      } else {
        await api.post(`/api/follows/${creator.userId}`);
      }
      setCreator({ ...creator, isFollowing: !creator.isFollowing });
    } finally {
      setFollowBusy(false);
    }
  };

  if (error) {
    return <p className="text-center text-sm text-red-400 py-16">{error}</p>;
  }

  if (!creator) {
    return <p className="text-center text-sm text-muted py-16">Loading...</p>;
  }

  const cover = mediaUrl(creator.coverImageUrl);
  const isOwnProfile = user?.id === creator.userId;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div
        className="h-48 bg-gradient-to-br from-brand/40 to-brand-2/40"
        style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />
      <div className="px-4">
        <div className="flex items-end justify-between -mt-10">
          <Avatar src={creator.avatarUrl} name={creator.displayName} size={88} />
          {!isOwnProfile && (
            <div className="flex gap-2 mb-1">
              <button
                onClick={toggleFollow}
                disabled={followBusy}
                className="px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-surface-2 transition-colors disabled:opacity-50"
              >
                {creator.isFollowing ? "Following" : "Follow"}
              </button>
              {creator.isSubscribed ? (
                <span className="px-4 py-2 rounded-full bg-surface-2 text-sm font-semibold text-brand">
                  Subscribed
                </span>
              ) : (
                <button
                  onClick={() => (user ? setShowSubscribe(true) : router.push("/login"))}
                  className="px-4 py-2 rounded-full brand-gradient text-white text-sm font-semibold"
                >
                  Subscribe ${creator.subscriptionPrice.toFixed(2)}/mo
                </button>
              )}
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold mt-3 flex items-center gap-1.5">
          {creator.displayName}
          {creator.verified && <span className="text-brand text-sm">✓</span>}
        </h1>
        <p className="text-sm text-muted">@{creator.username}</p>
        {creator.category && (
          <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-surface-2 text-muted">
            {creator.category}
          </span>
        )}
        {creator.bio && <p className="text-sm mt-3">{creator.bio}</p>}

        <div className="flex gap-5 mt-4 text-sm text-muted">
          <span>
            <strong className="text-white">{creator.subscriberCount}</strong> subscribers
          </span>
          <span>
            <strong className="text-white">{posts.length}</strong> posts
          </span>
        </div>
      </div>

      <div className="mt-8 px-4 space-y-6">
        {posts.length === 0 && (
          <p className="text-sm text-muted text-center py-12">No posts yet.</p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {showSubscribe && (
        <PaymentModal
          title={`Subscribe to ${creator.displayName}`}
          description="Get access to all subscriber-only posts for 30 days."
          amount={creator.subscriptionPrice}
          onConfirm={subscribe}
          onClose={() => setShowSubscribe(false)}
        />
      )}
    </div>
  );
}
