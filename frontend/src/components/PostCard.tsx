"use client";

import { useState } from "react";
import Link from "next/link";
import { api, mediaUrl } from "@/lib/api";
import { Comment, PageResponse, Post } from "@/lib/types";
import Avatar from "./Avatar";
import PaymentModal from "./PaymentModal";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function PostCard({ post: initialPost }: { post: Post }) {
  const [post, setPost] = useState(initialPost);
  const [showUnlock, setShowUnlock] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const toggleLike = async () => {
    const wasLiked = post.likedByMe;
    setPost((p) => ({
      ...p,
      likedByMe: !wasLiked,
      likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1,
    }));
    try {
      if (wasLiked) {
        await api.delete(`/api/posts/${post.id}/like`);
      } else {
        await api.post(`/api/posts/${post.id}/like`);
      }
    } catch {
      setPost((p) => ({
        ...p,
        likedByMe: wasLiked,
        likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1,
      }));
    }
  };

  const loadComments = async () => {
    if (!commentsOpen) {
      setCommentsOpen(true);
      if (!commentsLoaded) {
        const res = await api.get<PageResponse<Comment>>(`/api/posts/${post.id}/comments`);
        setComments(res.data.content);
        setCommentsLoaded(true);
      }
    } else {
      setCommentsOpen(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await api.post<Comment>(`/api/posts/${post.id}/comments`, {
        content: newComment.trim(),
      });
      setComments((c) => [res.data, ...c]);
      setNewComment("");
      setPost((p) => ({ ...p, commentCount: p.commentCount + 1 }));
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  };

  const unlock = async () => {
    const res = await api.post<Post>(`/api/posts/${post.id}/unlock`);
    setPost(res.data);
    setShowUnlock(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Link href={`/creators/${post.creatorUsername}`}>
          <Avatar src={post.creatorAvatarUrl} name={post.creatorDisplayName} size={40} />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/creators/${post.creatorUsername}`}
            className="font-semibold text-sm hover:underline"
          >
            {post.creatorDisplayName}
          </Link>
          <p className="text-xs text-muted">
            @{post.creatorUsername} · {timeAgo(post.createdAt)}
          </p>
        </div>
      </div>

      {post.caption && <p className="px-4 pb-3 text-sm whitespace-pre-wrap">{post.caption}</p>}

      {post.locked && !post.hasAccess ? (
        <div className="relative aspect-square bg-surface-2 flex flex-col items-center justify-center text-center px-6">
          <div className="absolute inset-0 backdrop-blur-2xl bg-gradient-to-br from-brand/20 to-brand-2/20" />
          <div className="relative z-10">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mx-auto mb-3 text-white"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="font-semibold mb-1">
              {post.mediaCount} locked {post.mediaCount === 1 ? "item" : "items"}
            </p>
            <p className="text-sm text-muted mb-4">Unlock this post to view the full content</p>
            <button
              onClick={() => setShowUnlock(true)}
              className="px-5 py-2 rounded-full brand-gradient text-white font-semibold text-sm"
            >
              Unlock for ${post.ppvPrice?.toFixed(2)}
            </button>
          </div>
        </div>
      ) : (
        post.media.length > 0 && (
          <div
            className={`grid gap-0.5 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {post.media.map((m) =>
              m.mediaType === "VIDEO" ? (
                <video
                  key={m.id}
                  src={mediaUrl(m.url) || undefined}
                  controls
                  className="w-full max-h-[520px] object-cover bg-black"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={mediaUrl(m.url) || undefined}
                  alt="Post media"
                  className="w-full max-h-[520px] object-cover"
                />
              )
            )}
          </div>
        )
      )}

      <div className="flex items-center gap-5 px-4 py-3 text-sm text-muted">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 transition-colors ${
            post.likedByMe ? "text-brand" : "hover:text-white"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={post.likedByMe ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
          </svg>
          {post.likeCount}
        </button>
        <button onClick={loadComments} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          {post.commentCount}
        </button>
      </div>

      {commentsOpen && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Add a comment..."
              className="flex-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm"
            />
            <button
              onClick={submitComment}
              disabled={posting}
              className="text-sm font-semibold text-brand disabled:opacity-50"
            >
              Post
            </button>
          </div>
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <Avatar src={c.avatarUrl} name={c.displayName} size={28} />
              <div>
                <span className="font-semibold mr-1.5">{c.displayName}</span>
                <span className="text-muted">{c.content}</span>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-xs text-muted text-center py-2">No comments yet</p>
          )}
        </div>
      )}

      {showUnlock && post.ppvPrice != null && (
        <PaymentModal
          title="Unlock post"
          description={`Unlock this post from ${post.creatorDisplayName}.`}
          amount={post.ppvPrice}
          onConfirm={unlock}
          onClose={() => setShowUnlock(false)}
        />
      )}
    </div>
  );
}
