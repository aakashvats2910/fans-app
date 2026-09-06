"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { AppNotification, PageResponse } from "@/lib/types";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationsContent() {
  const [items, setItems] = useState<AppNotification[] | null>(null);

  useEffect(() => {
    api
      .get<PageResponse<AppNotification>>("/api/notifications", { params: { size: 50 } })
      .then((res) => setItems(res.data.content));
    api.post("/api/notifications/read-all");
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Notifications</h1>
      {items === null && <p className="text-sm text-muted">Loading...</p>}
      {items?.length === 0 && <p className="text-sm text-muted">No notifications yet.</p>}
      <div className="space-y-1">
        {items?.map((n) => (
          <div key={n.id} className="flex gap-3 rounded-xl px-3 py-3 hover:bg-surface">
            <Avatar src={n.actorAvatarUrl} name={n.actorUsername || "?"} size={40} />
            <div>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted mt-0.5">{timeAgo(n.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsContent />
    </RequireAuth>
  );
}
