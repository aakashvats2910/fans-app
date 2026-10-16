import { Fragment, useMemo, useState } from "react";
import { MAP } from "../../data/seed";
import { fmtNum } from "../../lib";
import { useStore } from "../../store";
import { SearchBox } from "../../components/ui";
import { Icon } from "../../components/Icon";

type SortKey = "name" | "total" | "today";

export function Areas() {
  const { total, today, grandTotal, live } = useStore();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "total", dir: -1 });
  const [open, setOpen] = useState<string | null>(null);
  const [all, setAll] = useState(false);

  const rows = useMemo(() => {
    const m = new Map<string, { name: string; total: number; today: number; districts: number[] }>();
    MAP.districts.forEach((d, i) => {
      const r = m.get(d.state) ?? { name: d.state, total: 0, today: 0, districts: [] };
      r.total += total[i]; r.today += today[i]; r.districts.push(i);
      m.set(d.state, r);
    });
    const list = [...m.values()].filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
    list.sort((a, b) => (sort.key === "name" ? a.name.localeCompare(b.name) : a[sort.key] - b[sort.key]) * sort.dir);
    return list;
  }, [total, today, q, sort]);
  const max = Math.max(1, ...rows.map((r) => r.total));

  const head = (key: SortKey, label: string, cls = "") => (
    <th className={cls} aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button className="th-btn" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "name" ? 1 : -1 }))}>
        {label}{sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h2 className="page-title">Area-wise report</h2>
          <p className="muted">State totals with district breakdown. {live ? "Numbers move as bikes are registered." : "Live updates are paused."}</p>
        </div>
        <SearchBox id="area-q" value={q} onChange={setQ} placeholder="Search a state" />
      </div>

      <section className="card table-card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                {head("name", "State / UT")}
                {head("total", "Registered", "num")}
                <th className="bar-col" aria-hidden="true" />
                {head("today", "Today", "num")}
                <th className="num hide-sm">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isOpen = open === r.name;
                const ds = r.districts.map((i) => ({ i, d: MAP.districts[i] })).sort((a, b) => total[b.i] - total[a.i]);
                const shown = isOpen && all ? ds : ds.slice(0, 10);
                return (
                  <Fragment key={r.name}>
                    <tr className={"row-main" + (isOpen ? " open" : "")}>
                      <td>
                        <button className="expander" aria-expanded={isOpen} onClick={() => { setOpen(isOpen ? null : r.name); setAll(false); }}>
                          <Icon name="chevron" size={16} className={isOpen ? "rot90" : ""} /> {r.name}
                          <span className="muted small"> · {r.districts.length} districts</span>
                        </button>
                      </td>
                      <td className="num mono">{fmtNum(r.total)}</td>
                      <td className="bar-col"><span className="mini-bar"><i style={{ width: `${(r.total / max) * 100}%` }} /></span></td>
                      <td className="num mono">{fmtNum(r.today)}</td>
                      <td className="num mono hide-sm">{((r.total / grandTotal) * 100).toFixed(1)}%</td>
                    </tr>
                    {isOpen && shown.map(({ i, d }) => (
                      <tr key={i} className="row-sub">
                        <td><span className="sub-name">{d.name}</span></td>
                        <td className="num mono">{fmtNum(total[i])}</td>
                        <td className="bar-col"><span className="mini-bar"><i style={{ width: `${(total[i] / Math.max(1, total[ds[0].i])) * 100}%` }} /></span></td>
                        <td className="num mono">{fmtNum(today[i])}</td>
                        <td className="num mono hide-sm">{((total[i] / r.total) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                    {isOpen && ds.length > 10 && (
                      <tr className="row-sub">
                        <td colSpan={5}><button className="link" onClick={() => setAll(!all)}>{all ? "Show top 10 only" : `Show all ${ds.length} districts`}</button></td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {!rows.length && <tr><td colSpan={5} className="muted center-cell">No state matches “{q}”.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
