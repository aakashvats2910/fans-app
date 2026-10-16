import { useMemo, useState } from "react";
import { IndiaMap } from "../../components/IndiaMap";
import { CountUp, Kpi, SectionTitle, useTicker } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { MAP, dealerById } from "../../data/seed";
import { fmtNum, timeAgo, vehicleWarranty } from "../../lib";
import { useStore } from "../../store";

export function Overview({ onOpenVehicle }: { onOpenVehicle: (id: string) => void }) {
  const { total, today, pings, vehicles, live, setLive, grandTotal, grandToday, lastEventAt } = useStore();
  const [metric, setMetric] = useState<"all" | "today">("all");
  const [selected, setSelected] = useState<string | null>(null);
  useTicker(1000);

  const values = metric === "all" ? total : today;
  const expiring = useMemo(() => vehicles.filter((v) => vehicleWarranty(v) === "expiring").length, [vehicles]);
  const districtsToday = useMemo(() => today.filter((n) => n > 0).length, [today]);

  const ranking = useMemo(() => {
    if (selected) {
      return MAP.districts.map((d, i) => ({ name: d.name, n: values[i], state: d.state })).filter((x) => x.state === selected).sort((a, b) => b.n - a.n).slice(0, 8);
    }
    const m = new Map<string, number>();
    MAP.districts.forEach((d, i) => m.set(d.state, (m.get(d.state) ?? 0) + values[i]));
    return [...m].map(([name, n]) => ({ name, n, state: name })).sort((a, b) => b.n - a.n).slice(0, 8);
  }, [values, selected]);
  const topN = ranking[0]?.n || 1;
  const feed = vehicles.slice(0, 7);
  const secs = Math.max(0, Math.round((Date.now() - lastEventAt) / 1000));

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h2 className="page-title">Registrations across India</h2>
          <p className="muted">District-wise, updating as dealers register bikes.</p>
        </div>
        <button className={"live-pill" + (live ? " on" : "")} onClick={() => setLive(!live)} aria-pressed={live}>
          <span className={"live-dot" + (live ? "" : " off")} />
          {live ? `Live · last ${secs}s ago` : "Paused"}
          <span className="live-act">{live ? "Pause" : "Resume"}</span>
        </button>
      </div>

      <div className="kpis">
        <Kpi label="Total registered" value={<CountUp value={grandTotal} />} hint="all time, all states" />
        <Kpi label="Registered today" value={<CountUp value={grandToday} />} hint="since midnight" />
        <Kpi label="Districts active today" value={<>{districtsToday}<small> / {MAP.districts.length}</small></>} hint="at least one registration" />
        <Kpi label="Warranties ending soon" value={expiring} hint={`within 60 days, of ${vehicles.length} recent bikes`} tone="warn" />
      </div>

      <div className="overview-grid">
        <section className="card map-card">
          <div className="card-head">
            <div>
              <h3>{selected ?? "All states"}</h3>
              <span className="muted small">Each circle is a district. A deeper shade means more registrations.</span>
            </div>
            <div className="seg" role="radiogroup" aria-label="Map metric">
              <button role="radio" aria-checked={metric === "all"} className={metric === "all" ? "on" : ""} onClick={() => setMetric("all")}>All time</button>
              <button role="radio" aria-checked={metric === "today"} className={metric === "today" ? "on" : ""} onClick={() => setMetric("today")}>Today</button>
            </div>
          </div>
          <IndiaMap values={values} today={today} pings={pings} selected={selected} onSelect={setSelected} unit={metric === "all" ? "registrations" : "registered today"} />
        </section>

        <div className="stack-lg">
          <section className="card">
            <SectionTitle aside={selected ? <button className="link" onClick={() => setSelected(null)}>All India</button> : undefined}>
              {selected ? `Top districts in ${selected}` : "Top states"}
            </SectionTitle>
            <ol className="rank">
              {ranking.map((r, i) => (
                <li key={r.name}>
                  <button className="rank-row" onClick={() => !selected && setSelected(r.name)} disabled={!!selected}>
                    <span className="rank-n">{i + 1}</span>
                    <span className="rank-name">{r.name}</span>
                    <span className="rank-val mono">{fmtNum(r.n)}</span>
                    <span className="rank-bar"><i style={{ width: `${(r.n / topN) * 100}%` }} /></span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="card">
            <SectionTitle aside={<span className="muted small">newest first</span>}>Live feed</SectionTitle>
            <ul className="feed">
              {feed.map((v) => {
                const d = MAP.districts[v.district];
                return (
                  <li key={v.id}>
                    <button onClick={() => onOpenVehicle(v.id)}>
                      <span className="feed-ico"><Icon name="bike" size={18} /></span>
                      <span className="feed-main">
                        <b>{v.model}</b>
                        <span className="muted small">{d.name}, {d.state} · {dealerById(v.dealerId).name}</span>
                      </span>
                      <span className="muted small feed-time">{timeAgo(v.registeredAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
