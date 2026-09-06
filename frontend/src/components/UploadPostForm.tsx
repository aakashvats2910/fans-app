"use client";

import { FormEvent, useRef, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { Post } from "@/lib/types";

export default function UploadPostForm({ onCreated }: { onCreated: (post: Post) => void }) {
  const [caption, setCaption] = useState("");
  const [locked, setLocked] = useState(false);
  const [ppvPrice, setPpvPrice] = useState("4.99");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (files.length === 0) {
      setError("Add at least one photo or video");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("locked", String(locked));
      if (locked) formData.append("ppvPrice", ppvPrice);
      files.forEach((f) => formData.append("files", f));

      const res = await api.post<Post>("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreated(res.data);
      setCaption("");
      setLocked(false);
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(extractErrorMessage(err, "Could not publish post"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface p-5 space-y-4">
      <h2 className="font-semibold">Create a post</h2>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption..."
        rows={3}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm resize-none"
      />

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="w-full text-sm text-muted file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-surface-2 file:text-white"
        />
        {files.length > 0 && (
          <p className="text-xs text-muted mt-1">{files.length} file(s) selected</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
          Lock behind pay-per-view
        </label>
        {locked && (
          <div className="flex items-center gap-1 text-sm">
            <span>$</span>
            <input
              type="number"
              min="0.5"
              step="0.01"
              value={ppvPrice}
              onChange={(e) => setPpvPrice(e.target.value)}
              className="w-20 rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full brand-gradient text-white font-semibold text-sm px-5 py-2.5 disabled:opacity-60"
      >
        {submitting ? "Publishing..." : "Publish post"}
      </button>
    </form>
  );
}
