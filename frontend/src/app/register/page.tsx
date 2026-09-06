"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<"FAN" | "CREATOR">("FAN");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ username, email, password, displayName, role });
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-muted text-sm mb-8">
        This is a demo sign-up — payments are simulated, no real card is required.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole("FAN")}
          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
            role === "FAN" ? "border-brand bg-surface-2" : "border-border bg-surface"
          }`}
        >
          <p className="font-semibold text-sm">I&apos;m a fan</p>
          <p className="text-xs text-muted mt-1">Subscribe to creators</p>
        </button>
        <button
          type="button"
          onClick={() => setRole("CREATOR")}
          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
            role === "CREATOR" ? "border-brand bg-surface-2" : "border-border bg-surface"
          }`}
        >
          <p className="font-semibold text-sm">I&apos;m a creator</p>
          <p className="text-xs text-muted mt-1">Post & earn</p>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Display name</label>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-brand"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            pattern="^[a-zA-Z0-9_.]+$"
            title="Letters, numbers, underscores and dots only"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-brand"
            placeholder="jane.doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-brand"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-brand"
            placeholder="At least 6 characters"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full brand-gradient text-white font-semibold py-2.5 disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-white font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
