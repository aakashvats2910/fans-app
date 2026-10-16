import { useMemo, useState } from "react";
import type { PartKind, Vehicle } from "../../types";
import { COLOURS, MAP, MODELS, STATES, dealerById, makeVehicle, newChassis, newSerial, nextRegNo, stateDistricts } from "../../data/seed";
import { PARTS, PART_ID_LABEL } from "../../lib";
import { useStore } from "../../store";
import { Icon } from "../../components/Icon";
import { Plate } from "../../components/Plate";
import { QR } from "../../components/QR";

interface Form {
  model: string; colour: string; chassis: string;
  motor: string; controller: string; battery: string;
  name: string; phone: string; state: string; district: number;
}

export function Register({ dealerId, open }: { dealerId: string; open: (id: string) => void }) {
  const { register } = useStore();
  const dealer = dealerById(dealerId);
  const home = MAP.districts[dealer.district];
  const blank = (): Form => ({
    model: MODELS[0].name, colour: COLOURS[1], chassis: "", motor: "", controller: "", battery: "",
    name: "", phone: "", state: home.state, district: dealer.district,
  });
  const [f, setF] = useState<Form>(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [done, setDone] = useState<Vehicle | null>(null);
  const districts = useMemo(() => stateDistricts(f.state), [f.state]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const fillSample = () => setF((x) => ({ ...x, chassis: newChassis(), motor: newSerial("motor"), controller: newSerial("controller"), battery: newSerial("battery") }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (f.chassis.trim().length < 10) er.chassis = "Enter the 10+ character chassis number stamped on the frame.";
    PARTS.forEach((k) => { if (f[k].trim().length < 6) er[k] = `Enter the ${PART_ID_LABEL[k].toLowerCase()} from the part label.`; });
    if (f.name.trim().length < 2) er.name = "Enter the owner's name.";
    if (!/^[6-9]\d{9}$/.test(f.phone)) er.phone = "Enter a 10-digit Indian mobile number.";
    setErrors(er);
    if (Object.keys(er).length) {
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    const model = MODELS.find((m) => m.name === f.model)!;
    const now = new Date();
    const base = makeVehicle({ dealer: { ...dealer, district: f.district }, at: now, r: Math.random });
    const v: Vehicle = {
      ...base, id: nextRegNo(f.state, now), model: f.model, colour: f.colour, chassis: f.chassis.trim().toUpperCase(),
      dealerId, district: f.district, owner: { name: f.name.trim(), phone: f.phone },
      parts: Object.fromEntries(PARTS.map((k) => [k, { serial: f[k].trim().toUpperCase(), installedOn: now.toISOString(), warrantyMonths: model.warrantyMonths[k] }])) as Vehicle["parts"],
      history: [],
    };
    register(v);
    setDone(v);
    window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <div className="success-page">
        <span className="success-ico"><Icon name="check" size={30} /></span>
        <h2>Vehicle registered</h2>
        <p className="muted">{done.owner.name} can now see this bike and its warranty on their phone.</p>
        <div className="card success-card">
          <Plate regNo={done.id} size="lg" />
          <QR regNo={done.id} size={168} />
          <p className="muted small">Fix this QR on the number plate before delivery. Scanning it opens the vehicle record.</p>
          <dl className="kv kv-grid">
            <div><dt>Model</dt><dd>{done.model}</dd></div>
            <div><dt>Registered in</dt><dd>{MAP.districts[done.district].name}</dd></div>
          </dl>
        </div>
        <div className="row wrap gap-sm center">
          <button className="btn btn-primary" onClick={() => open(done.id)}>View vehicle</button>
          <button className="btn" onClick={() => { setDone(null); setF(blank()); setErrors({}); }}>Register another</button>
        </div>
      </div>
    );
  }

  const err = (k: keyof Form) => errors[k] && <span className="field-err" id={`${k}-err`}>{errors[k]}</span>;
  const ia = (k: keyof Form) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined } as const);

  return (
    <form className="form stack-lg" onSubmit={submit} noValidate>
      <div className="page-head">
        <div>
          <h2 className="page-title">Register a vehicle</h2>
          <p className="muted">Register before you hand over the bike. Takes about a minute.</p>
        </div>
        <button type="button" className="btn btn-sm" onClick={fillSample}>Fill sample details</button>
      </div>

      <fieldset className="card fieldset">
        <legend>1. Vehicle</legend>
        <div className="field">
          <label htmlFor="model">Model</label>
          <select id="model" className="input" value={f.model} onChange={(e) => set("model", e.target.value)}>
            {MODELS.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div className="field">
          <span className="label" id="colour-l">Colour</span>
          <div className="chips" role="radiogroup" aria-labelledby="colour-l">
            {COLOURS.map((c) => <button type="button" key={c} role="radio" aria-checked={f.colour === c} className={"chip" + (f.colour === c ? " on" : "")} onClick={() => set("colour", c)}>{c}</button>)}
          </div>
        </div>
        <div className="field">
          <label htmlFor="chassis">Chassis number</label>
          <input id="chassis" className="input mono" value={f.chassis} onChange={(e) => set("chassis", e.target.value)} placeholder="Stamped on the frame" autoCapitalize="characters" {...ia("chassis")} />
          {err("chassis")}
        </div>
      </fieldset>

      <fieldset className="card fieldset">
        <legend>2. Parts fitted</legend>
        <p className="muted small">Serial numbers start each part's warranty. Check them against the labels.</p>
        <div className="field-grid">
          {PARTS.map((k: PartKind) => (
            <div className="field" key={k}>
              <label htmlFor={k}>{PART_ID_LABEL[k]}</label>
              <input id={k} className="input mono" value={f[k]} onChange={(e) => set(k, e.target.value)} placeholder={k === "motor" ? "MTR-250-…" : k === "controller" ? "CTL-48V-…" : "BAT-48V20-…"} autoCapitalize="characters" {...ia(k)} />
              {err(k)}
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="card fieldset">
        <legend>3. Owner and area</legend>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="name">Owner name</label>
            <input id="name" className="input" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" {...ia("name")} />
            {err("name")}
          </div>
          <div className="field">
            <label htmlFor="phone">Mobile number</label>
            <input id="phone" className="input" inputMode="numeric" maxLength={10} value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} placeholder="10 digits" autoComplete="off" {...ia("phone")} />
            {err("phone")}
          </div>
          <div className="field">
            <label htmlFor="state">State</label>
            <select id="state" className="input" value={f.state} onChange={(e) => setF((x) => ({ ...x, state: e.target.value, district: stateDistricts(e.target.value)[0].i }))}>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="district">District</label>
            <select id="district" className="input" value={f.district} onChange={(e) => set("district", Number(e.target.value))}>
              {districts.map(({ d, i }) => <option key={i} value={i}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </fieldset>

      <div className="form-actions">
        <span className="muted small">Registering as {dealer.name}</span>
        <button className="btn btn-primary btn-lg" type="submit">Register vehicle</button>
      </div>
    </form>
  );
}
