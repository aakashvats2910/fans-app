"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/feed");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return null;
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(600px circle at 20% 10%, rgba(176,69,154,0.35), transparent 60%), radial-gradient(600px circle at 80% 30%, rgba(108,60,224,0.35), transparent 60%)",
        }}
      />
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Get closer to the creators
          <br />
          <span className="brand-gradient-text">you love</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-xl mx-auto">
          Velvra is a subscription platform where creators share exclusive photos, videos, and
          posts directly with their biggest fans.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3 rounded-full font-semibold text-white brand-gradient hover:opacity-90 transition-opacity"
          >
            Get started free
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 rounded-full font-semibold border border-border hover:bg-surface transition-colors"
          >
            Explore creators
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24 grid sm:grid-cols-3 gap-6">
        {[
          {
            title: "Exclusive content",
            body: "Photos and videos that only your subscribers get to see.",
          },
          {
            title: "Simple subscriptions",
            body: "Fans pay a monthly price you set, plus optional pay-per-view unlocks.",
          },
          {
            title: "Direct connection",
            body: "Likes, comments, and followers keep the conversation going.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
