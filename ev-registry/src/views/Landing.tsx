import type { Role } from "../types";
import { Icon } from "../components/Icon";
import { Logo, ThemeButton } from "../components/Shell";
import { useStore } from "../store";
import { fmtNum } from "../lib";

const ROLES: { id: Role; title: string; icon: string; blurb: string; who: string; cta: string }[] = [
  { id: "company", title: "Company", icon: "building", who: "Ereganto · HQ", cta: "Open command centre", blurb: "Live registrations on the India map, area-wise reports and every warranty on record." },
  { id: "dealer", title: "Dealer", icon: "store", who: "Sharma E-Bikes · Lucknow", cta: "Open dealer desk", blurb: "Register a bike before you sell it, scan a plate QR, check warranty and parts history." },
  { id: "owner", title: "Vehicle owner", icon: "bike", who: "Rohit Verma", cta: "Open my EV", blurb: "Your registration, warranty on motor, controller and battery, and every part swap." },
];

export function Landing({ onPick }: { onPick: (r: Role) => void }) {
  const { grandTotal, live } = useStore();
  return (
    <div className="landing">
      <header className="landing-top">
        <div className="brand"><Logo size={34} /><b>EV Pehchaan</b></div>
        <ThemeButton />
      </header>
      <section className="landing-hero">
        <p className="eyebrow"><span className={"live-dot" + (live ? "" : " off")} /> {fmtNum(grandTotal)} bikes on the registry</p>
        <h1>One registry for every non‑RTO e‑bike on the road.</h1>
        <p className="lead">Registration, warranty and parts history for low-speed electric bikes, from the factory to the dealer to the owner.</p>
      </section>
      <section className="role-grid" aria-label="Choose a role">
        {ROLES.map((r) => (
          <button key={r.id} className={`role-card role-${r.id}`} onClick={() => onPick(r.id)}>
            <span className="role-ico"><Icon name={r.icon} size={26} /></span>
            <h2>{r.title}</h2>
            <p>{r.blurb}</p>
            <span className="role-who">{r.who}</span>
            <span className="role-cta">{r.cta} <Icon name="chevron" size={16} /></span>
          </button>
        ))}
      </section>
      <p className="landing-note">Demo with sample data. Nothing here is a real vehicle, owner or dealer.</p>
    </div>
  );
}
