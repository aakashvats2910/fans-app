import { useEffect, useRef, useState, type ReactNode } from "react";
import { fmtNum } from "../lib";

/** Number that eases to its new value, so live counters feel alive without jumping. */
export function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current, delta = value - start;
    if (!delta) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setShown(value); from.current = value; return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 600);
      const v = Math.round(start + delta * (1 - Math.pow(1 - k, 3)));
      setShown(v); from.current = v;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{fmtNum(shown)}</>;
}

export function Kpi({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "warn" }) {
  return (
    <div className={"kpi" + (tone ? ` kpi-${tone}` : "")}>
      <span className="kpi-label">{label}</span>
      <b className="kpi-value">{value}</b>
      {hint && <span className="kpi-hint">{hint}</span>}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {aside}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder: string; id: string }) {
  return (
    <div className="search">
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <input id={id} className="input" type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function useTicker(ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => {
    const t = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}
