"use client";

import { FormEvent, useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Avatar from "@/components/Avatar";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CreatorProfile } from "@/lib/types";

function SettingsContent() {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [subscriptionPrice, setSubscriptionPrice] = useState("9.99");
  const [category, setCategory] = useState("");
  const [savingCreator, setSavingCreator] = useState(false);
  const [creatorMessage, setCreatorMessage] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    if (user?.role === "CREATOR") {
      api.get<CreatorProfile>(`/api/creators/${user.username}`).then((res) => {
        setCreatorProfile(res.data);
        setSubscriptionPrice(String(res.data.subscriptionPrice));
        setCategory(res.data.category || "");
      });
    }
  }, [user]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      await api.put("/api/users/me", { displayName, bio });
      await refreshUser();
      setProfileMessage("Profile updated");
    } catch (err) {
      setProfileMessage(extractErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/api/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveCreatorProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingCreator(true);
    setCreatorMessage(null);
    try {
      const res = await api.put<CreatorProfile>("/api/creators/me", {
        subscriptionPrice: Number(subscriptionPrice),
        category,
      });
      setCreatorProfile(res.data);
      setCreatorMessage("Creator settings updated");
    } catch (err) {
      setCreatorMessage(extractErrorMessage(err));
    } finally {
      setSavingCreator(false);
    }
  };

  const uploadCover = async (file: File) => {
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/api/creators/me/cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (user) {
        const res = await api.get<CreatorProfile>(`/api/creators/${user.username}`);
        setCreatorProfile(res.data);
      }
    } finally {
      setCoverUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="flex items-center gap-4">
          <Avatar src={user.avatarUrl} name={user.displayName} size={64} />
          <label className="text-sm font-semibold text-brand cursor-pointer">
            {avatarUploading ? "Uploading..." : "Change avatar"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
            />
          </label>
        </div>

        <form onSubmit={saveProfile} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm resize-none"
            />
          </div>
          {profileMessage && <p className="text-sm text-muted">{profileMessage}</p>}
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-full brand-gradient text-white text-sm font-semibold px-5 py-2 disabled:opacity-60"
          >
            Save profile
          </button>
        </form>
      </div>

      {user.role === "CREATOR" && creatorProfile && (
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="font-semibold">Creator settings</h2>
          <div>
            <label className="text-sm font-semibold text-brand cursor-pointer">
              {coverUploading ? "Uploading..." : "Change cover image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
              />
            </label>
          </div>
          <form onSubmit={saveCreatorProfile} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly subscription price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={subscriptionPrice}
                onChange={(e) => setSubscriptionPrice(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Fitness, Art, Music"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
              />
            </div>
            {creatorMessage && <p className="text-sm text-muted">{creatorMessage}</p>}
            <button
              type="submit"
              disabled={savingCreator}
              className="rounded-full brand-gradient text-white text-sm font-semibold px-5 py-2 disabled:opacity-60"
            >
              Save creator settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
