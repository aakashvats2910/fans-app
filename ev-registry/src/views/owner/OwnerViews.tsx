import { HistoryTimeline, PartsGrid, RegistrationCard } from "../../components/VehicleBits";
import { SectionTitle } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { MAP, dealerById } from "../../data/seed";
import { PARTS, partWarranty } from "../../lib";
import { useStore } from "../../store";

function useMine(id: string) {
  const v = useStore().byId(id);
  if (!v) throw new Error("owner vehicle missing");
  return v;
}

export function OwnerHome({ id, go }: { id: string; go: (tab: string) => void }) {
  const v = useMine(id);
  const dealer = dealerById(v.dealerId);
  const expiring = PARTS.filter((k) => partWarranty(v.parts[k]).status === "expiring");
  return (
    <div className="stack-lg">
      <div>
        <h2 className="page-title">Hello, {v.owner.name.split(" ")[0]}</h2>
        <p className="muted">Your {v.model} is registered and covered.</p>
      </div>
      {expiring.length > 0 && (
        <button className="notice notice-warn notice-btn" onClick={() => go("warranty")}>
          <Icon name="clock" size={20} />
          <span><b>{expiring.map((k) => k).join(" and ")} warranty ends soon.</b> Get it checked at your dealer before it does.</span>
          <Icon name="chevron" size={16} />
        </button>
      )}
      <RegistrationCard vehicle={v} showOwner={false} />
      <section className="card dealer-card">
        <div className="feed-ico"><Icon name="store" size={20} /></div>
        <div>
          <b>{dealer.name}</b>
          <p className="muted small">{MAP.districts[dealer.district].name}, {MAP.districts[dealer.district].state}</p>
          <p className="small">Call <span className="mono">+91 {dealer.phone}</span> for service or a part replacement.</p>
        </div>
      </section>
    </div>
  );
}

export function OwnerWarranty({ id }: { id: string }) {
  const v = useMine(id);
  return (
    <div className="stack-lg">
      <div>
        <h2 className="page-title">Warranty</h2>
        <p className="muted">Each part has its own warranty. A replaced part starts a new one.</p>
      </div>
      <PartsGrid vehicle={v} />
    </div>
  );
}

export function OwnerHistory({ id }: { id: string }) {
  const v = useMine(id);
  return (
    <div className="stack-lg">
      <div>
        <h2 className="page-title">Parts replaced</h2>
        <p className="muted">A record of every motor, controller and battery change on {v.id}.</p>
      </div>
      <section className="card">
        <SectionTitle>{v.history.length} replacement{v.history.length === 1 ? "" : "s"}</SectionTitle>
        <HistoryTimeline vehicle={v} />
      </section>
    </div>
  );
}
