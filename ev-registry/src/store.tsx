import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { PartKind, Replacement, Vehicle } from "./types";
import {
  BASE_TODAY, BASE_TOTAL, DEALERS, DEMO_DEALER_ID, DEMO_OWNER_VEHICLE, MAP, makeVehicle, pickDistrict, seedVehicles,
} from "./data/seed";
import { mulberry32 } from "./lib";

export interface Ping {
  id: number;
  district: number;
  at: number;
}

interface State {
  vehicles: Vehicle[];
  total: number[];
  today: number[];
  pings: Ping[];
  live: boolean;
  lastEventAt: number;
  demoOwnerVehicle: string;
}

type Action =
  | { type: "tick"; vehicle: Vehicle }
  | { type: "register"; vehicle: Vehicle }
  | { type: "replace"; vehicleId: string; part: PartKind; newSerial: string; reason: string; dealerId: string }
  | { type: "live"; on: boolean }
  | { type: "prune" };

let pingId = 0;

function addVehicle(s: State, v: Vehicle): State {
  const total = s.total.slice();
  const today = s.today.slice();
  total[v.district]++;
  today[v.district]++;
  const pings = [...s.pings.filter((p) => Date.now() - p.at < 2500), { id: ++pingId, district: v.district, at: Date.now() }];
  return { ...s, vehicles: [v, ...s.vehicles], total, today, pings, lastEventAt: Date.now() };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "tick":
    case "register":
      return addVehicle(s, a.vehicle);
    case "replace":
      return {
        ...s,
        vehicles: s.vehicles.map((v) => {
          if (v.id !== a.vehicleId) return v;
          const now = new Date().toISOString();
          const old = v.parts[a.part];
          const rep: Replacement = {
            id: `R-${Math.floor(20000 + Math.random() * 79999)}`, date: now, part: a.part, oldSerial: old.serial,
            newSerial: a.newSerial, reason: a.reason, dealerId: a.dealerId,
          };
          return {
            ...v,
            parts: { ...v.parts, [a.part]: { serial: a.newSerial, installedOn: now, warrantyMonths: old.warrantyMonths } },
            history: [rep, ...v.history],
          };
        }),
      };
    case "live":
      return { ...s, live: a.on };
    case "prune":
      return s.pings.length ? { ...s, pings: s.pings.filter((p) => Date.now() - p.at < 2500) } : s;
  }
}

function init(): State {
  const vehicles = seedVehicles();
  return {
    vehicles, total: BASE_TOTAL.slice(), today: BASE_TODAY.slice(), pings: [], live: true,
    lastEventAt: Date.now(), demoOwnerVehicle: DEMO_OWNER_VEHICLE,
  };
}

interface Ctx extends State {
  register: (v: Vehicle) => void;
  replacePart: (vehicleId: string, part: PartKind, newSerial: string, reason: string, dealerId: string) => void;
  setLive: (on: boolean) => void;
  byId: (id: string) => Vehicle | undefined;
  grandTotal: number;
  grandToday: number;
}

const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  // Simulated real-time feed: a new registration lands every few seconds, anywhere in the country.
  useEffect(() => {
    if (!state.live) return;
    const r = mulberry32(Date.now() & 0xffff);
    let timer: number;
    const loop = () => {
      const di = pickDistrict(r);
      const near = DEALERS.filter((d) => MAP.districts[d.district].state === MAP.districts[di].state);
      const dealer = near[Math.floor(r() * near.length)] ?? DEALERS[1];
      dispatch({ type: "tick", vehicle: makeVehicle({ dealer, at: new Date(), r }) });
      timer = window.setTimeout(loop, 1800 + r() * 3200);
    };
    timer = window.setTimeout(loop, 1500);
    return () => clearTimeout(timer);
  }, [state.live]);

  useEffect(() => {
    const t = window.setInterval(() => dispatch({ type: "prune" }), 3000);
    return () => clearInterval(t);
  }, []);

  const value = useMemo<Ctx>(() => {
    const index = new Map(state.vehicles.map((v) => [v.id, v]));
    return {
      ...state,
      register: (vehicle) => dispatch({ type: "register", vehicle }),
      replacePart: (vehicleId, part, newSerial, reason, dealerId) =>
        dispatch({ type: "replace", vehicleId, part, newSerial, reason, dealerId }),
      setLive: (on) => dispatch({ type: "live", on }),
      byId: (id) => index.get(id),
      grandTotal: state.total.reduce((a, b) => a + b, 0),
      grandToday: state.today.reduce((a, b) => a + b, 0),
    };
  }, [state]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export { DEMO_DEALER_ID };
