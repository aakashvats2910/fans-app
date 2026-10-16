import { useState } from "react";
import type { PartKind, Vehicle, WarrantyStatus } from "../types";
import {
  PARTS, PART_ID_LABEL, PART_LABEL, fmtDate, humanDays, partWarranty, registrationPeriod, vehicleWarranty,
} from "../lib";
import { REASON_OPTIONS, MAP, dealerById, newSerial } from "../data/seed";
import { Icon } from "./Icon";
import { Plate } from "./Plate";
import { QR } from "./QR";
import { useStore } from "../store";

export const STATUS_TEXT: Record<WarrantyStatus, string> = { active: "Active", expiring: "Expiring soon", expired: "Expired" };

export function StatusPill({ status, children }: { status: WarrantyStatus; children?: React.ReactNode }) {
  const icon = status === "active" ? "check" : status === "expiring" ? "clock" : "alert";
  return (
    <span className={`pill pill-${status}`}>
      <Icon name={icon} size={14} /> {children ?? STATUS_TEXT[status]}
    </span>
  );
}

export function Bar({ pct, tone = "brand" }: { pct: number; tone?: WarrantyStatus | "brand" }) {
  return (
    <div className={`bar bar-${tone}`} role="presentation">
      <i style={{ width: `${Math.round(Math.min(1, Math.max(0, pct)) * 100)}%` }} />
    </div>
  );
}

const PART_ICON: Record<PartKind, string> = { motor: "motor", controller: "chip", battery: "battery" };

export function PartCard({ vehicle, kind, onReplace }: { vehicle: Vehicle; kind: PartKind; onReplace?: () => void }) {
  const p = vehicle.parts[kind];
  const w = partWarranty(p);
  const replaced = vehicle.history.some((h) => h.part === kind);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(p.serial).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }, () => {});
  };
  return (
    <article className="part-card">
      <header>
        <span className={`part-ico part-${kind}`}><Icon name={PART_ICON[kind]} size={20} /></span>
        <div>
          <h4>{PART_LABEL[kind]}</h4>
          <span className="muted small">{p.warrantyMonths}-month warranty{replaced ? " · replaced part" : ""}</span>
        </div>
        <StatusPill status={w.status} />
      </header>
      <dl className="kv">
        <div>
          <dt>{PART_ID_LABEL[kind]}</dt>
          <dd className="mono serial">
            {p.serial}
            <button className="icon-btn" onClick={copy} aria-label={`Copy ${PART_ID_LABEL[kind]}`}>
              <Icon name={copied ? "check" : "copy"} size={15} />
            </button>
          </dd>
        </div>
      </dl>
      <Bar pct={w.pctUsed} tone={w.status} />
      <div className="row between small">
        <span className="muted">{fmtDate(w.start)}</span>
        <b className={`tone-${w.status}`}>{humanDays(w.daysLeft)}</b>
        <span className="muted">{fmtDate(w.end)}</span>
      </div>
      {onReplace && (
        <button className="btn btn-sm" onClick={onReplace}><Icon name="wrench" size={16} /> Replace {PART_LABEL[kind].toLowerCase()}</button>
      )}
    </article>
  );
}

export function PartsGrid({ vehicle, onReplace }: { vehicle: Vehicle; onReplace?: (k: PartKind) => void }) {
  return (
    <div className="parts-grid">
      {PARTS.map((k) => <PartCard key={k} vehicle={vehicle} kind={k} onReplace={onReplace ? () => onReplace(k) : undefined} />)}
    </div>
  );
}

export function HistoryTimeline({ vehicle }: { vehicle: Vehicle }) {
  if (!vehicle.history.length) {
    return (
      <div className="empty">
        <Icon name="wrench" size={28} />
        <b>No parts replaced yet</b>
        <span className="muted">Every motor, controller or battery swap done at a dealer will appear here.</span>
      </div>
    );
  }
  return (
    <ol className="timeline">
      {vehicle.history.map((h) => (
        <li key={h.id}>
          <span className={`tl-dot part-${h.part}`}><Icon name={PART_ICON[h.part]} size={14} /></span>
          <div className="tl-body">
            <div className="row between wrap gap-sm">
              <b>{PART_LABEL[h.part]} replaced</b>
              <span className="muted small">{fmtDate(h.date)}</span>
            </div>
            <p className="muted small">{h.reason} · {dealerById(h.dealerId).name}, {MAP.districts[dealerById(h.dealerId).district].name}</p>
            <div className="swap mono small">
              <span className="old">{h.oldSerial}</span>
              <Icon name="chevron" size={14} />
              <span>{h.newSerial}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RegistrationCard({ vehicle, showOwner = true }: { vehicle: Vehicle; showOwner?: boolean }) {
  const reg = registrationPeriod(vehicle);
  const dealer = dealerById(vehicle.dealerId);
  const d = MAP.districts[vehicle.district];
  const overall = vehicleWarranty(vehicle);
  return (
    <section className="card reg-card">
      <div className="reg-top">
        <div className="reg-id">
          <Plate regNo={vehicle.id} size="lg" />
          <div className="reg-model">
            <h2>{vehicle.model}</h2>
            <span className="muted">{vehicle.colour} · 250 W · non-RTO</span>
          </div>
          <StatusPill status={overall}>Warranty {STATUS_TEXT[overall].toLowerCase()}</StatusPill>
        </div>
        <div className="reg-qr">
          <QR regNo={vehicle.id} size={116} />
          <span className="muted small">QR on plate</span>
        </div>
      </div>

      <div className="period">
        <div className="row between small">
          <span><span className="muted">Registered</span> <b>{fmtDate(reg.start)}</b></span>
          <span><span className="muted">Valid till</span> <b>{fmtDate(reg.end)}</b></span>
        </div>
        <Bar pct={reg.pctUsed} />
        <span className="muted small">{vehicle.validYears}-year registration · {humanDays(reg.daysLeft)}</span>
      </div>

      <dl className="kv kv-grid">
        <div><dt>Chassis number</dt><dd className="mono">{vehicle.chassis}</dd></div>
        <div><dt>Location</dt><dd>{d.name}, {d.state}</dd></div>
        <div><dt>Sold by</dt><dd>{dealer.name}</dd></div>
        {showOwner && <div><dt>Owner</dt><dd>{vehicle.owner.name}</dd></div>}
      </dl>
    </section>
  );
}

export function ReplaceSheet({ vehicle, initial, dealerId, onClose }: { vehicle: Vehicle; initial: PartKind; dealerId: string; onClose: () => void }) {
  const { replacePart } = useStore();
  const [kind, setKind] = useState<PartKind>(initial);
  const [serial, setSerial] = useState("");
  const [reason, setReason] = useState(REASON_OPTIONS[initial][0]);
  const [done, setDone] = useState(false);
  const pick = (k: PartKind) => { setKind(k); setReason(REASON_OPTIONS[k][0]); setSerial(""); };
  const valid = serial.trim().length >= 6 && serial.trim().toUpperCase() !== vehicle.parts[kind].serial;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Replace a part" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="success">
            <span className="success-ico"><Icon name="check" size={28} /></span>
            <h3>{PART_LABEL[kind]} replaced</h3>
            <p className="muted">The owner now sees the new serial and a fresh warranty on {vehicle.id}.</p>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); replacePart(vehicle.id, kind, serial.trim().toUpperCase(), reason, dealerId); setDone(true); }}>
            <header className="row between">
              <h3>Replace a part</h3>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="plus" size={20} className="rot45" /></button>
            </header>
            <div className="seg" role="radiogroup" aria-label="Part">
              {PARTS.map((k) => (
                <button type="button" key={k} role="radio" aria-checked={kind === k} className={kind === k ? "on" : ""} onClick={() => pick(k)}>{PART_LABEL[k]}</button>
              ))}
            </div>
            <p className="small muted">Current {PART_ID_LABEL[kind].toLowerCase()}: <span className="mono">{vehicle.parts[kind].serial}</span></p>
            <div className="field">
              <label htmlFor="new-serial">New {PART_ID_LABEL[kind].toLowerCase()}</label>
              <div className="row gap-sm">
                <input id="new-serial" className="input mono grow" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="Type or scan from the part label" autoCapitalize="characters" />
                <button type="button" className="btn btn-sm" onClick={() => setSerial(newSerial(kind))}>Fill sample</button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="reason">Reason</label>
              <select id="reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASON_OPTIONS[kind].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={!valid}>Confirm replacement</button>
          </form>
        )}
      </div>
    </div>
  );
}
