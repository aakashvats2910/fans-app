import { useMemo, useState } from "react";
import type { PartKind, WarrantyStatus } from "../../types";
import { MAP } from "../../data/seed";
import { PARTS, PART_LABEL, fmtDate, humanDays, partWarranty, vehicleWarranty } from "../../lib";
import { useStore } from "../../store";
import { SearchBox, SectionTitle } from "../../components/ui";
import { Plate } from "../../components/Plate";
import { StatusPill, STATUS_TEXT } from "../../components/VehicleBits";

type Filter = "all" | WarrantyStatus;
const FILTERS: Filter[] = ["all", "active", "expiring", "expired"];

export function Warranty({ onOpenVehicle }: { onOpenVehicle: (id: string) => void }) {
  const { vehicles } = useStore();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filter>("all");
  const [limit, setLimit] = useState(40);

  const rows = useMemo(() => vehicles.map((v) => ({ v, s: vehicleWarranty(v) })), [vehicles]);
  const counts = useMemo(() => {
    const c = { all: rows.length, active: 0, expiring: 0, expired: 0 };
    rows.forEach((r) => c[r.s]++);
    return c;
  }, [rows]);
  const perPart = useMemo(() => {
    const out = {} as Record<PartKind, Record<WarrantyStatus, number>>;
    PARTS.forEach((k) => {
      out[k] = { active: 0, expiring: 0, expired: 0 };
      vehicles.forEach((v) => out[k][partWarranty(v.parts[k]).status]++);
    });
    return out;
  }, [vehicles]);

  const filtered = rows.filter(({ v, s }) => {
    if (f !== "all" && s !== f) return false;
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return [v.id, v.owner.name, v.model, MAP.districts[v.district].name, ...PARTS.map((k) => v.parts[k].serial)].some((x) => x.toLowerCase().includes(t));
  });

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h2 className="page-title">Warranty register</h2>
          <p className="muted">Warranty on motor, controller and battery for the {vehicles.length} most recent registrations.</p>
        </div>
      </div>

      <div className="warranty-top">
        <section className="card">
          <SectionTitle>By status</SectionTitle>
          <div className="chips" role="radiogroup" aria-label="Filter by warranty status">
            {FILTERS.map((x) => (
              <button key={x} role="radio" aria-checked={f === x} className={"chip" + (f === x ? " on" : "") + ` chip-${x}`} onClick={() => { setF(x); setLimit(40); }}>
                {x === "all" ? "All" : STATUS_TEXT[x]} <b>{counts[x]}</b>
              </button>
            ))}
          </div>
        </section>
        <section className="card">
          <SectionTitle>By part</SectionTitle>
          <div className="part-stack">
            {PARTS.map((k) => {
              const c = perPart[k]; const n = vehicles.length || 1;
              return (
                <div key={k} className="part-line">
                  <span>{PART_LABEL[k]}</span>
                  <span className="stackbar" role="img" aria-label={`${PART_LABEL[k]}: ${c.active} active, ${c.expiring} expiring, ${c.expired} expired`}>
                    <i className="s-active" style={{ width: `${(c.active / n) * 100}%` }} />
                    <i className="s-expiring" style={{ width: `${(c.expiring / n) * 100}%` }} />
                    <i className="s-expired" style={{ width: `${(c.expired / n) * 100}%` }} />
                  </span>
                  <span className="mono small muted">{Math.round((c.active / n) * 100)}% active</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-head">
          <h3>Vehicles</h3>
          <SearchBox id="war-q" value={q} onChange={setQ} placeholder="Search reg. no, owner, serial, district" />
        </div>
        <div className="table-scroll">
          <table className="table table-vehicles">
            <thead>
              <tr><th>Registration</th><th className="hide-sm">Owner</th><th className="hide-md">Location</th><th className="hide-md">Registered</th>{PARTS.map((k) => <th key={k} className="hide-sm">{PART_LABEL[k]}</th>)}<th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.slice(0, limit).map(({ v, s }) => (
                <tr key={v.id} className="clickable" onClick={() => onOpenVehicle(v.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpenVehicle(v.id)}>
                  <td><Plate regNo={v.id} size="sm" /><div className="muted small cell-sub">{v.model}</div></td>
                  <td className="hide-sm">{v.owner.name}</td>
                  <td className="hide-md">{MAP.districts[v.district].name}<div className="muted small">{MAP.districts[v.district].state}</div></td>
                  <td className="hide-md">{fmtDate(v.registeredAt)}</td>
                  {PARTS.map((k) => {
                    const w = partWarranty(v.parts[k]);
                    return <td key={k} className="hide-sm"><span className={`dotline tone-${w.status}`}><i />{w.status === "expired" ? "Ended" : humanDays(w.daysLeft).replace(" left", "")}</span></td>;
                  })}
                  <td><StatusPill status={s} /></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={8} className="muted center-cell">No vehicles match.</td></tr>}
            </tbody>
          </table>
        </div>
        {filtered.length > limit && (
          <div className="table-foot"><button className="btn" onClick={() => setLimit(limit + 60)}>Show more ({filtered.length - limit} left)</button></div>
        )}
      </section>
    </div>
  );
}
