import { useMemo, useState } from "react";
import { Plate } from "../../components/Plate";
import { SearchBox } from "../../components/ui";
import { StatusPill } from "../../components/VehicleBits";
import { fmtDate, vehicleWarranty } from "../../lib";
import { useStore } from "../../store";

export function DealerVehicles({ dealerId, open }: { dealerId: string; open: (id: string) => void }) {
  const { vehicles } = useStore();
  const [q, setQ] = useState("");
  const mine = useMemo(() => vehicles.filter((v) => v.dealerId === dealerId), [vehicles, dealerId]);
  const list = mine.filter((v) => !q.trim() || [v.id, v.owner.name, v.model, v.chassis].some((x) => x.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h2 className="page-title">Your vehicles</h2>
          <p className="muted">{mine.length} bikes registered through your shop.</p>
        </div>
        <SearchBox id="mine-q" value={q} onChange={setQ} placeholder="Search owner, reg. no, chassis" />
      </div>
      <section className="card">
        <ul className="vlist">
          {list.map((v) => (
            <li key={v.id}>
              <button onClick={() => open(v.id)}>
                <Plate regNo={v.id} size="sm" />
                <span className="vlist-main"><b>{v.owner.name}</b><span className="muted small">{v.model} · {fmtDate(v.registeredAt)}</span></span>
                <StatusPill status={vehicleWarranty(v)} />
              </button>
            </li>
          ))}
          {!list.length && <li className="muted center-cell">No vehicles match.</li>}
        </ul>
      </section>
    </div>
  );
}
