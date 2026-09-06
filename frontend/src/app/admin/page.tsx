"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { AdminStats, PageResponse, UserSummary } from "@/lib/types";

function AdminContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadUsers = async () => {
    const res = await api.get<PageResponse<UserSummary>>("/api/admin/users", { params: { size: 50 } });
    setUsers(res.data.content);
  };

  useEffect(() => {
    api.get<AdminStats>("/api/admin/stats").then((res) => setStats(res.data));
    loadUsers();
  }, []);

  const toggleEnabled = async (u: UserSummary, enable: boolean) => {
    setBusyId(u.id);
    try {
      await api.post(`/api/admin/users/${u.id}/${enable ? "enable" : "disable"}`);
      await loadUsers();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-bold">Admin panel</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total users", value: stats.totalUsers },
            { label: "Fans", value: stats.totalFans },
            { label: "Creators", value: stats.totalCreators },
            { label: "Posts", value: stats.totalPosts },
            { label: "Active subscriptions", value: stats.totalActiveSubscriptions },
            { label: "Platform revenue (simulated)", value: `$${stats.totalRevenue.toFixed(2)}` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs text-muted mb-1">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-3">Users</h2>
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={u.avatarUrl} name={u.displayName} size={36} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.displayName}</p>
                  <p className="text-xs text-muted truncate">
                    @{u.username} · {u.role}
                  </p>
                </div>
              </div>
              {u.role !== "ADMIN" && (
                <button
                  disabled={busyId === u.id}
                  onClick={() => toggleEnabled(u, false)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-surface-2 transition-colors disabled:opacity-50"
                >
                  Disable
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth role="ADMIN">
      <AdminContent />
    </RequireAuth>
  );
}
