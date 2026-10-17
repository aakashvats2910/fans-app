import { useEffect, useState } from "react";
import type { Role } from "./types";
import { Shell, type NavItem } from "./components/Shell";
import { Landing } from "./views/Landing";
import { Overview } from "./views/company/Overview";
import { Areas } from "./views/company/Areas";
import { Warranty } from "./views/company/Warranty";
import { DealerHome } from "./views/dealer/Home";
import { Register } from "./views/dealer/Register";
import { ScanPage } from "./views/dealer/Scan";
import { DealerVehicles } from "./views/dealer/Mine";
import { OwnerHistory, OwnerHome, OwnerWarranty } from "./views/owner/OwnerViews";
import { VehicleDetail } from "./views/VehicleDetail";
import { DEMO_DEALER_ID } from "./data/seed";
import { useStore } from "./store";

const NAV: Record<Role, NavItem[]> = {
  company: [
    { id: "live", label: "Live map", icon: "map" },
    { id: "areas", label: "Area report", icon: "table" },
    { id: "warranty", label: "Warranty", icon: "shield" },
  ],
  dealer: [
    { id: "home", label: "Home", icon: "home" },
    { id: "register", label: "Register", icon: "plus" },
    { id: "scan", label: "Scan", icon: "scan" },
    { id: "mine", label: "Vehicles", icon: "bike" },
  ],
  owner: [
    { id: "home", label: "My EV", icon: "bike" },
    { id: "warranty", label: "Warranty", icon: "shield" },
    { id: "history", label: "Parts history", icon: "wrench" },
  ],
};
const FIRST_TAB: Record<Role, string> = { company: "live", dealer: "home", owner: "home" };
const WHO: Record<Role, string> = { company: "syfr.live · HQ", dealer: "Sharma E-Bikes", owner: "Rohit Verma" };

export function App() {
  const { demoOwnerVehicle } = useStore();
  const [role, setRole] = useState<Role | null>(null);
  const [tab, setTab] = useState("");
  const [vehicle, setVehicle] = useState<string | null>(null);

  useEffect(() => window.scrollTo({ top: 0 }), [tab, vehicle, role]);

  if (!role) return <Landing onPick={(r) => { setRole(r); setTab(FIRST_TAB[r]); setVehicle(null); }} />;

  const nav = NAV[role];
  const go = (t: string) => { setTab(t); setVehicle(null); };
  const title = vehicle ? "Vehicle" : nav.find((n) => n.id === tab)?.label ?? "";

  let body;
  if (vehicle) {
    body = <VehicleDetail id={vehicle} dealerId={role === "dealer" ? DEMO_DEALER_ID : undefined} />;
  } else if (role === "company") {
    body = tab === "areas" ? <Areas /> : tab === "warranty" ? <Warranty onOpenVehicle={setVehicle} /> : <Overview onOpenVehicle={setVehicle} />;
  } else if (role === "dealer") {
    body =
      tab === "register" ? <Register dealerId={DEMO_DEALER_ID} open={setVehicle} /> :
      tab === "scan" ? <ScanPage dealerId={DEMO_DEALER_ID} open={setVehicle} /> :
      tab === "mine" ? <DealerVehicles dealerId={DEMO_DEALER_ID} open={setVehicle} /> :
      <DealerHome dealerId={DEMO_DEALER_ID} go={go} open={setVehicle} />;
  } else {
    body = tab === "warranty" ? <OwnerWarranty id={demoOwnerVehicle} /> : tab === "history" ? <OwnerHistory id={demoOwnerVehicle} /> : <OwnerHome id={demoOwnerVehicle} go={go} />;
  }

  return (
    <Shell role={role} who={WHO[role]} nav={nav} tab={tab} onTab={go} onSwitch={() => setRole(null)} title={title} back={vehicle ? () => setVehicle(null) : undefined}>
      <div className={`page page-${role}`}>{body}</div>
    </Shell>
  );
}
