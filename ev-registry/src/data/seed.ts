import raw from "./indiaMap.json";
import type { Dealer, MapData, PartKind, Replacement, Vehicle } from "../types";
import { DAY, mulberry32 } from "../lib";

export const MAP = raw as unknown as MapData;

export const STATE_CODE: Record<string, string> = {
  "Andaman and Nicobar Islands": "AN", "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", Assam: "AS",
  Bihar: "BR", Chandigarh: "CH", Chhattisgarh: "CG", "Dadra and Nagar Haveli and Daman and Diu": "DD",
  Delhi: "DL", Goa: "GA", Gujarat: "GJ", Haryana: "HR", "Himachal Pradesh": "HP", "Jammu and Kashmir": "JK",
  Jharkhand: "JH", Karnataka: "KA", Kerala: "KL", Ladakh: "LA", Lakshadweep: "LD", "Madhya Pradesh": "MP",
  Maharashtra: "MH", Manipur: "MN", Meghalaya: "ML", Mizoram: "MZ", Nagaland: "NL", Odisha: "OD",
  Puducherry: "PY", Punjab: "PB", Rajasthan: "RJ", Sikkim: "SK", "Tamil Nadu": "TN", Telangana: "TG",
  Tripura: "TR", "Uttar Pradesh": "UP", Uttarakhand: "UK", "West Bengal": "WB",
};

// Relative appetite for small EV bikes. Dummy numbers, shaped like a plausible Indian market.
const STATE_WEIGHT: Record<string, number> = {
  "Uttar Pradesh": 14, Maharashtra: 12, Gujarat: 9, Karnataka: 8, "Tamil Nadu": 8, Rajasthan: 7,
  "West Bengal": 7, Bihar: 7, Delhi: 6, "Madhya Pradesh": 6, "Andhra Pradesh": 5, Telangana: 5,
  Haryana: 4, Kerala: 4, Punjab: 3, Odisha: 3, Assam: 3, Jharkhand: 3, Chhattisgarh: 2, Uttarakhand: 2,
  "Himachal Pradesh": 1, "Jammu and Kashmir": 1.4, Goa: 0.8, Chandigarh: 0.8, Puducherry: 0.6, Tripura: 0.5,
  Meghalaya: 0.4, Manipur: 0.4, Nagaland: 0.3, Sikkim: 0.3, "Arunachal Pradesh": 0.3, Mizoram: 0.3,
  Ladakh: 0.2, "Dadra and Nagar Haveli and Daman and Diu": 0.4, "Andaman and Nicobar Islands": 0.15, Lakshadweep: 0.05,
};
const CITIES = [
  "Lucknow", "Kanpur Nagar", "Pune", "Mumbai", "Thane", "Nagpur", "Surat", "Vadodara", "Rajkot", "Bengaluru Urban",
  "Mysuru", "Chennai", "Coimbatore", "Madurai", "Jaipur", "Jodhpur", "Patna", "Kolkata", "Hyderabad", "Delhi",
  "Indore", "Bhopal", "Ludhiana", "Gurugram", "Agra", "Varanasi", "Prayagraj", "Ghaziabad", "Gautam Buddha Nagar",
  "Ranchi", "Kamrup Metropolitan", "Thiruvananthapuram", "Ernakulam", "Visakhapatnam", "Amritsar", "Dehradun",
  "Khordha", "Raipur",
];

export const districtIndex = (name: string, state?: string) =>
  MAP.districts.findIndex((d) => d.name === name && (!state || d.state === state));

export const stateDistricts = (state: string) =>
  MAP.districts.map((d, i) => ({ d, i })).filter((x) => x.d.state === state);

export const STATES = [...new Set(MAP.districts.map((d) => d.state))].sort();

// ---- district weights & base counts -------------------------------------------------------
const rng = mulberry32(2610);
export const DISTRICT_WEIGHT: number[] = MAP.districts.map((d) => {
  const w = STATE_WEIGHT[d.state] ?? 0.5;
  const nStateDistricts = MAP.districts.filter((x) => x.state === d.state).length;
  const spread = Math.exp((rng() - 0.5) * 2.2);
  const city = CITIES.includes(d.name) ? 4.5 : 1;
  return (w / Math.sqrt(nStateDistricts)) * spread * city;
});
const wSum = DISTRICT_WEIGHT.reduce((a, b) => a + b, 0);

const TOTAL_BASE = 148_000;
const DAILY_BASE = 620;
const dayFraction = Math.max(0.2, (Date.now() % DAY) / DAY); // roughly "today so far" in UTC; dummy
export const BASE_TOTAL = DISTRICT_WEIGHT.map((w) => Math.max(2, Math.round((w / wSum) * TOTAL_BASE * (0.9 + rng() * 0.2))));
export const BASE_TODAY = DISTRICT_WEIGHT.map((w) => Math.round((w / wSum) * DAILY_BASE * dayFraction * (0.6 + rng() * 0.8)));

export function pickDistrict(r: () => number): number {
  let x = r() * wSum;
  for (let i = 0; i < DISTRICT_WEIGHT.length; i++) {
    x -= DISTRICT_WEIGHT[i];
    if (x <= 0) return i;
  }
  return DISTRICT_WEIGHT.length - 1;
}

// ---- people, models, dealers --------------------------------------------------------------
const FIRST = ["Aarav", "Rohit", "Sneha", "Priya", "Imran", "Kavita", "Suresh", "Anita", "Manoj", "Deepak", "Farhan", "Lakshmi", "Harpreet", "Joseph", "Meena", "Ravi", "Sunita", "Vikram", "Pooja", "Arjun", "Nisha", "Ganesh", "Salma", "Dinesh", "Bhavna", "Karthik", "Rekha", "Amit", "Tarun", "Geeta"];
const LAST = ["Verma", "Sharma", "Patel", "Reddy", "Khan", "Singh", "Nair", "Iyer", "Das", "Yadav", "Gupta", "Joshi", "Mishra", "Pillai", "Chauhan", "Banerjee", "Kulkarni", "Thakur", "Mehta", "Rao"];
export const MODELS = [
  { name: "Zelio Glide 250", note: "Commuter · 250 W hub motor", warrantyMonths: { motor: 36, controller: 24, battery: 24 } },
  { name: "Zelio Swift 250", note: "Sport · 250 W hub motor", warrantyMonths: { motor: 36, controller: 24, battery: 24 } },
  { name: "Zelio Cargo 250", note: "Load carrier · 250 W hub motor", warrantyMonths: { motor: 36, controller: 24, battery: 30 } },
  { name: "Zelio Lite 250", note: "Compact · 250 W hub motor", warrantyMonths: { motor: 24, controller: 24, battery: 18 } },
];
export const COLOURS = ["Pearl White", "Forest Green", "Matte Black", "Signal Red", "Ocean Blue", "Sunrise Yellow"];
const DEALER_A = ["Sharma", "Gupta", "Patel", "Reddy", "Khan", "Singh", "Nair", "Joshi", "Mehta", "Rao", "Das", "Yadav", "Green", "Volt", "Eco", "Sri Ganesh", "Balaji", "Shakti", "Jai Bharat", "Metro"];
const DEALER_B = ["E-Bikes", "Electric Wheels", "EV Hub", "E-Mobility", "Auto Agency", "Motors", "Zero Emission Rides"];

const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const digits = (r: () => number, n: number) => Array.from({ length: n }, () => Math.floor(r() * 10)).join("");

export const newSerial = (kind: PartKind, r: () => number = Math.random) =>
  kind === "motor" ? `MTR-250-${digits(r, 7)}` : kind === "controller" ? `CTL-48V-${digits(r, 6)}` : `BAT-48V20-${digits(r, 7)}`;
export const newChassis = (r: () => number = Math.random) =>
  `MD6${String.fromCharCode(65 + Math.floor(r() * 26))}${digits(r, 2)}EV${digits(r, 8)}`;

export const DEMO_DEALER_ID = "D-001";
export const DEALERS: Dealer[] = [];
{
  const lucknow = districtIndex("Lucknow", "Uttar Pradesh");
  DEALERS.push({ id: DEMO_DEALER_ID, name: "Sharma E-Bikes", district: lucknow, phone: "9415012345" });
  const r = mulberry32(77);
  const used = new Set<number>([lucknow]);
  while (DEALERS.length < 60) {
    const di = pickDistrict(r);
    if (used.has(di) && r() < 0.8) continue;
    used.add(di);
    DEALERS.push({
      id: `D-${String(DEALERS.length + 1).padStart(3, "0")}`,
      name: `${pick(r, DEALER_A)} ${pick(r, DEALER_B)}`,
      district: di,
      phone: `9${digits(r, 9)}`,
    });
  }
}
export const dealerById = (id: string) => DEALERS.find((d) => d.id === id) ?? DEALERS[0];

// ---- vehicles -----------------------------------------------------------------------------
const REASONS: Record<PartKind, string[]> = {
  motor: ["Hub motor noise", "Bearing failure", "Water ingress"],
  controller: ["Controller overheating", "Throttle fault", "Short circuit"],
  battery: ["Capacity drop under 70%", "Cell imbalance", "Battery not charging"],
};
let seq = 4200;
export const nextRegNo = (state: string, at = new Date()) =>
  `EV-${STATE_CODE[state] ?? "XX"}-${String(at.getFullYear()).slice(2)}-${String(++seq).padStart(6, "0")}`;

interface MakeOpts {
  dealer: Dealer;
  at: Date;
  r: () => number;
  name?: string;
  withHistory?: boolean;
}
export function makeVehicle({ dealer, at, r, name, withHistory }: MakeOpts): Vehicle {
  const model = pick(r, MODELS);
  const iso = at.toISOString();
  const d = MAP.districts[dealer.district];
  const parts = {} as Vehicle["parts"];
  (["motor", "controller", "battery"] as PartKind[]).forEach((k) => {
    parts[k] = { serial: newSerial(k, r), installedOn: iso, warrantyMonths: model.warrantyMonths[k] };
  });
  const history: Replacement[] = [];
  if (withHistory) {
    const k = pick(r, ["battery", "battery", "controller", "motor"] as PartKind[]);
    const when = new Date(+at + (20 + r() * 200) * DAY);
    if (+when < Date.now()) {
      const newS = newSerial(k, r);
      history.push({
        id: `R-${digits(r, 5)}`, date: when.toISOString(), part: k, oldSerial: parts[k].serial, newSerial: newS,
        reason: pick(r, REASONS[k]), dealerId: dealer.id,
      });
      parts[k] = { serial: newS, installedOn: when.toISOString(), warrantyMonths: parts[k].warrantyMonths };
    }
  }
  return {
    id: nextRegNo(d.state, at), model: model.name, colour: pick(r, COLOURS), chassis: newChassis(r),
    dealerId: dealer.id, district: dealer.district,
    owner: { name: name ?? `${pick(r, FIRST)} ${pick(r, LAST)}`, phone: `${pick(r, ["98", "99", "97", "96", "70", "89", "63"])}${digits(r, 8)}` },
    registeredAt: iso, validYears: 5, parts, history,
  };
}

export const REASON_OPTIONS = REASONS;

export const DEMO_OWNER_NAME = "Rohit Verma";
export let DEMO_OWNER_VEHICLE = "";

export function seedVehicles(): Vehicle[] {
  const r = mulberry32(99);
  const out: Vehicle[] = [];
  const now = Date.now();
  const byWeight = (d: Dealer) => DISTRICT_WEIGHT[d.district];
  const total = DEALERS.reduce((a, d) => a + byWeight(d), 0);
  const dealerPick = () => {
    let x = r() * total;
    for (const d of DEALERS) { x -= byWeight(d); if (x <= 0) return d; }
    return DEALERS[0];
  };
  const demo = DEALERS[0];

  // Demo owner: registered ~22 months ago, controller and motor replaced since, original battery warranty about to end.
  const ownerAt = new Date(now - 22.6 * 30.4 * DAY);
  const ov = makeVehicle({ dealer: demo, at: ownerAt, r, name: DEMO_OWNER_NAME });
  ov.model = "Zelio Glide 250"; ov.colour = "Forest Green";
  ov.parts.motor.warrantyMonths = 36; ov.parts.controller.warrantyMonths = 24; ov.parts.battery.warrantyMonths = 24;
  const cWhen = new Date(now - 11 * 30.4 * DAY);
  const newCtl = newSerial("controller", r);
  ov.history.push({ id: "R-20193", date: cWhen.toISOString(), part: "controller", oldSerial: ov.parts.controller.serial, newSerial: newCtl, reason: "Throttle fault", dealerId: demo.id });
  ov.parts.controller = { serial: newCtl, installedOn: cWhen.toISOString(), warrantyMonths: 24 };
  const mWhen = new Date(now - 3 * 30.4 * DAY);
  const newMtr = newSerial("motor", r);
  ov.history.push({ id: "R-20417", date: mWhen.toISOString(), part: "motor", oldSerial: ov.parts.motor.serial, newSerial: newMtr, reason: "Bearing failure", dealerId: demo.id });
  ov.parts.motor = { serial: newMtr, installedOn: mWhen.toISOString(), warrantyMonths: 36 };
  ov.history.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  DEMO_OWNER_VEHICLE = ov.id;
  out.push(ov);

  // Demo dealer's own recent customers.
  for (let i = 0; i < 18; i++) {
    const at = new Date(now - (i < 3 ? i * 1.5 * 3600e3 + 3600e3 : (2 + i * 6 + r() * 5) * DAY));
    out.push(makeVehicle({ dealer: demo, at, r, withHistory: r() < 0.3 }));
  }
  // The rest of the network.
  for (let i = 0; i < 520; i++) {
    const age = i < 5 ? (i * 4 + 2) * 60e3 : Math.pow(r(), 1.7) * 30 * 30.4 * DAY + 3 * DAY;
    out.push(makeVehicle({ dealer: dealerPick(), at: new Date(now - age), r, withHistory: r() < 0.18 }));
  }
  return out.sort((a, b) => +new Date(b.registeredAt) - +new Date(a.registeredAt));
}
