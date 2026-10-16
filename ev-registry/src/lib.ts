import type { Part, PartKind, Vehicle, WarrantyStatus } from "./types";

export const DAY = 86_400_000;

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const addMonths = (iso: string, months: number) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const fmtNum = (n: number) => n.toLocaleString("en-IN");

export const daysBetween = (a: number | Date, b: number | Date) =>
  Math.ceil((+b - +a) / DAY);

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(0, Math.round((now - +new Date(iso)) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return fmtDate(iso);
}

export const PART_LABEL: Record<PartKind, string> = {
  motor: "Motor",
  controller: "Controller",
  battery: "Battery",
};
export const PART_ID_LABEL: Record<PartKind, string> = {
  motor: "Motor number",
  controller: "Controller serial",
  battery: "Battery serial",
};
export const PARTS: PartKind[] = ["motor", "controller", "battery"];

export interface PartWarranty {
  start: Date;
  end: Date;
  daysLeft: number;
  totalDays: number;
  pctUsed: number;
  status: WarrantyStatus;
}

export function partWarranty(p: Part, now = Date.now()): PartWarranty {
  const start = new Date(p.installedOn);
  const end = addMonths(p.installedOn, p.warrantyMonths);
  const totalDays = Math.max(1, daysBetween(start, end));
  const daysLeft = daysBetween(now, end);
  const status: WarrantyStatus = daysLeft <= 0 ? "expired" : daysLeft <= 60 ? "expiring" : "active";
  return { start, end, daysLeft, totalDays, pctUsed: Math.min(1, Math.max(0, 1 - daysLeft / totalDays)), status };
}

export function vehicleWarranty(v: Vehicle, now = Date.now()): WarrantyStatus {
  const s = PARTS.map((k) => partWarranty(v.parts[k], now).status);
  if (s.every((x) => x === "expired")) return "expired";
  if (s.includes("expiring")) return "expiring";
  return "active";
}

export function registrationPeriod(v: Vehicle, now = Date.now()) {
  const start = new Date(v.registeredAt);
  const end = addMonths(v.registeredAt, v.validYears * 12);
  const total = daysBetween(start, end);
  const left = daysBetween(now, end);
  return { start, end, daysLeft: left, pctUsed: Math.min(1, Math.max(0, 1 - left / total)) };
}

export function humanDays(d: number) {
  if (d <= 0) return "Expired";
  if (d < 45) return `${d} day${d === 1 ? "" : "s"} left`;
  const m = Math.round(d / 30.4);
  if (m < 24) return `${m} month${m === 1 ? "" : "s"} left`;
  const y = d / 365;
  return `${y.toFixed(1)} years left`;
}

export const plateParts = (id: string) => id.split("-"); // EV, UP, 26, 004821

export function extractRegNo(text: string): string | null {
  const m = text.toUpperCase().match(/EV-[A-Z]{2}-\d{2}-\d{6}/);
  return m ? m[0] : null;
}

export const maskPhone = (p: string) => `+91 ${p.slice(0, 2)}••• ••${p.slice(-3)}`;
export const qrPayload = (id: string) => `https://evpehchaan.in/v/${id}`;
