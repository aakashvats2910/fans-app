import { useEffect, useState, type ReactNode } from "react";
import type { Role } from "../types";
import { Icon } from "./Icon";

export interface NavItem { id: string; label: string; icon: string }

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="6" width="30" height="20" rx="5" fill="var(--plate)" />
      <rect x="3.5" y="8.5" width="25" height="15" rx="3" fill="none" stroke="var(--plate-ink)" strokeWidth="1.2" opacity=".5" />
      <path d="M17.5 9.5 11 17.2h4.4l-1.2 5.3 6.6-7.8h-4.4l1.1-5.2Z" fill="var(--plate-ink)" />
    </svg>
  );
}

const ROLE_LABEL: Record<Role, string> = { company: "Company", dealer: "Dealer", owner: "Vehicle owner" };

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(() => {
    try { const t = localStorage.getItem("evp-theme"); return t === "dark" || t === "light" ? t : null; } catch { return null; }
  });
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme; else delete document.documentElement.dataset.theme;
    try { theme ? localStorage.setItem("evp-theme", theme) : localStorage.removeItem("evp-theme"); } catch { /* storage unavailable */ }
  }, [theme]);
  const isDark = theme ? theme === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return { isDark, toggle: () => setTheme(isDark ? "light" : "dark") };
}

export function ThemeButton() {
  const { isDark, toggle } = useTheme();
  return (
    <button className="icon-btn" onClick={toggle} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}>
      <Icon name={isDark ? "sun" : "moon"} />
    </button>
  );
}

interface Props {
  role: Role;
  who: string;
  nav: NavItem[];
  tab: string;
  onTab: (id: string) => void;
  onSwitch: () => void;
  title: string;
  back?: () => void;
  children: ReactNode;
}

export function Shell({ role, who, nav, tab, onTab, onSwitch, title, back, children }: Props) {
  return (
    <div className={`app app-${role}`}>
      <aside className="side">
        <div className="brand"><Logo /><b>Zelio</b></div>
        <div className="who">
          <span className="who-role">{ROLE_LABEL[role]}</span>
          <b>{who}</b>
        </div>
        <nav aria-label="Main">
          {nav.map((n) => (
            <button key={n.id} className={"nav-item" + (tab === n.id && !back ? " on" : "")} onClick={() => onTab(n.id)} aria-current={tab === n.id && !back ? "page" : undefined}>
              <Icon name={n.icon} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <button className="nav-item" onClick={onSwitch}><Icon name="swap" /> Switch role</button>
          <div className="row between"><span className="muted small">Demo data</span><ThemeButton /></div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          {back ? (
            <button className="icon-btn" onClick={back} aria-label="Back"><Icon name="back" /></button>
          ) : (
            <span className="topbar-logo tb-extra"><Logo size={28} /></span>
          )}
          <h1>{title}</h1>
          <span className="grow" />
          <span className="tb-extra"><ThemeButton /></span>
          <button className="icon-btn tb-extra" onClick={onSwitch} aria-label="Switch role"><Icon name="swap" /></button>
        </header>
        <main className="content">{children}</main>
      </div>

      <nav className="tabbar" aria-label="Main">
        {nav.map((n) => (
          <button key={n.id} className={tab === n.id && !back ? "on" : ""} onClick={() => onTab(n.id)} aria-current={tab === n.id && !back ? "page" : undefined}>
            <Icon name={n.icon} size={22} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
