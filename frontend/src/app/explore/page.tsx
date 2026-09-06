"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CreatorProfile, PageResponse } from "@/lib/types";
import CreatorCard from "@/components/CreatorCard";

export default function ExplorePage() {
  const [creators, setCreators] = useState<CreatorProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PageResponse<CreatorProfile>>("/api/creators", { params: { size: 24 } })
      .then((res) => setCreators(res.data.content))
      .catch(() => setError("Could not load creators"));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">Explore creators</h1>
      <p className="text-sm text-muted mb-6">Discover creators and subscribe to their content.</p>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {creators === null && !error && (
        <p className="text-sm text-muted text-center py-12">Loading creators...</p>
      )}
      {creators && creators.length === 0 && (
        <p className="text-sm text-muted text-center py-12">No creators yet. Be the first!</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {creators?.map((c) => (
          <CreatorCard key={c.userId} creator={c} />
        ))}
      </div>
    </div>
  );
}
