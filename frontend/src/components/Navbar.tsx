"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Avatar from "./Avatar";
import NotificationsBell from "./NotificationsBell";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        pathname === href
          ? "text-white bg-surface-2"
          : "text-muted hover:text-white hover:bg-surface-2"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        <Link href="/" className="text-xl font-bold brand-gradient-text">
          Velvra
        </Link>

        {!loading && user && (
          <nav className="hidden sm:flex items-center gap-1">
            {navLink("/feed", "Feed")}
            {navLink("/explore", "Explore")}
            {user.role === "CREATOR" && navLink("/studio", "Studio")}
            {user.role === "ADMIN" && navLink("/admin", "Admin")}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <NotificationsBell />
              <Link href="/settings" className="flex items-center gap-2">
                <Avatar src={user.avatarUrl} name={user.displayName} size={34} />
              </Link>
              <button
                onClick={logout}
                className="text-sm text-muted hover:text-white transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-4 py-2 rounded-full brand-gradient text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
