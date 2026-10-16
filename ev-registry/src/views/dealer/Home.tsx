import { useMemo } from "react";
import { MAP, dealerById } from "../../data/seed";
import { Icon } from "../../components/Icon";
import { Kpi, SectionTitle } from "../../components/ui";
import { Plate } from "../../components/Plate";
import { StatusPill } from "../../components/VehicleBits";
import { timeAgo, vehicleWarranty } from "../../lib";
import { useStore } from "../../store";

export function DealerHome({ dealerId, go, open }: { dealerId: string; go: (tab: string) => void; open: (id: string) => void }) {
  const { vehicles } = useStore();
  const dealer = dealerById(dealerId);
  const mine = useMemo(() => vehicles.filter((v) => v.dealerId === dealerId), [vehicles, dealerId]);
  const month = mine.filter((v) => new Date(v.registeredAt).getMonth() === new Date().getMonth()).length;
  const expiring = mine.filter((v) => vehicleWarranty(v) === "expiring").length;
  return (
    <div className="stack-lg">
      <div>
        <h2 className="page-title">Namaste, {dealer.name.split(" ")[0]}</h2>
        <p className="muted">{dealer.name} · {MAP.districts[dealer.district].name}, {MAP.districts[dealer.district].state}</p>
      </div>

      <div className="action-grid">
        <button className="action action-primary" onClick={() => go("register")}>
          <span className="action-ico"><Icon name="plus" size={26} /></span>
          <b>Register a vehicle</b>
          <span>Do this before the sale, so the owner gets warranty from day one.</span>
        </button>
        <button className="action" onClick={() => go("scan")}>
          <span className="action-ico"><Icon name="scan" size={26} /></span>
          <b>Scan plate QR</b>
          <span>See registration, warranty and parts history in one tap.</span>
        </button>
      </div>

      <div className="kpis kpis-3">
        <Kpi label="Registered by you" value={mine.length} hint="all time" />
        <Kpi label="This month" value={month} />
        <Kpi label="Warranties ending soon" value={expiring} hint="your customers, 60 days" tone={expiring ? "warn" : undefined} />
      </div>

      <section className="card">
        <SectionTitle aside={<button className="link" onClick={() => go("mine")}>See all</button>}>Recent registrations</SectionTitle>
        <ul className="vlist">
          {mine.slice(0, 5).map((v) => (
            <li key={v.id}>
              <button onClick={() => open(v.id)}>
                <Plate regNo={v.id} size="sm" />
                <span className="vlist-main"><b>{v.owner.name}</b><span className="muted small">{v.model} · {timeAgo(v.registeredAt)}</span></span>
                <StatusPill status={vehicleWarranty(v)} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
