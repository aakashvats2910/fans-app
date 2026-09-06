"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { AppNotification, PageResponse } from "@/lib/types";
import Avatar from "./Avatar";

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

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const loadUnread = useCallback(async () => {
    try {
      const res = await api.get<{ count: number }>("/api/notifications/unread-count");
      setUnread(res.data.count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 20000);
    return () => clearInterval(interval);
  }, [loadUnread]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const res = await api.get<PageResponse<AppNotification>>("/api/notifications", {
        params: { size: 10 },
      });
      setItems(res.data.content);
      await api.post("/api/notifications/read-all");
      setUnread(0);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-border rounded-xl shadow-xl z-50">
          <div className="px-4 py-3 border-b border-border font-semibold text-sm">Notifications</div>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted text-center">No notifications yet</div>
          ) : (
            items.map((n) => (
              <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-border/50 last:border-0">
                <Avatar src={n.actorAvatarUrl} name={n.actorUsername || "?"} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{n.message}</p>
                  <p className="text-xs text-muted mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
