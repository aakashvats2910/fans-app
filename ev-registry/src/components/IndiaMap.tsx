import { memo, useEffect, useMemo, useRef, useState } from "react";
import { MAP } from "../data/seed";
import type { Ping } from "../store";
import { fmtNum } from "../lib";
import { Icon } from "./Icon";

const W = MAP.width;
const H = MAP.height;
const STEPS = 7;

interface VB { x: number; y: number; w: number; h: number }
const FULL: VB = { x: 0, y: 0, w: W, h: H };

interface Props {
  values: number[]; // one number per district
  today: number[];
  pings: Ping[];
  selected: string | null;
  onSelect: (state: string | null) => void;
  unit: string; // "registrations"
}

function IndiaMapImpl({ values, today, pings, selected, onSelect, unit }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const statePaths = useRef<Record<string, SVGPathElement | null>>({});
  const [vb, setVb] = useState<VB>(FULL);
  const vbRef = useRef(vb);
  vbRef.current = vb;
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

  // Darkness scale: log-spaced so a handful of big cities do not wash out everything else.
  const { min, max, step } = useMemo(() => {
    let lo = Infinity, hi = 0;
    for (const v of values) { if (v > 0) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    if (!isFinite(lo)) lo = 1;
    const a = Math.log(lo), b = Math.log(Math.max(hi, lo + 1));
    return { min: lo, max: hi, step: (v: number) => Math.min(STEPS - 1, Math.max(0, Math.floor(((Math.log(Math.max(v, lo)) - a) / (b - a)) * STEPS))) };
  }, [values]);

  // Zoom to the selected state (or back to the whole country) with a short ease.
  useEffect(() => {
    let target = FULL;
    if (selected && statePaths.current[selected]) {
      const b = statePaths.current[selected]!.getBBox();
      const pad = Math.max(b.width, b.height) * 0.22 + 6;
      let w = b.width + pad * 2, h = b.height + pad * 2;
      const ratio = W / H;
      if (w / h < ratio) w = h * ratio; else h = w / ratio;
      w = Math.max(w, 90); h = w / ratio;
      target = { x: b.x + b.width / 2 - w / 2, y: b.y + b.height / 2 - h / 2, w, h };
    }
    const from = vbRef.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVb(target); return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 520);
      const e = 1 - Math.pow(1 - k, 3);
      setVb({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e });
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selected]);

  const zoom = Math.pow(vb.w / W, 0.72);
  const showDistrictShapes = selected !== null;
  const hd = hover ? MAP.districts[hover.i] : null;

  const move = (e: React.PointerEvent, i: number) => {
    const r = wrap.current!.getBoundingClientRect();
    setHover({ i, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div className="map-wrap" ref={wrap}>
      <svg
        className="map-svg"
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        role="img"
        aria-label={`Map of India with ${unit} by district. Deeper circles mean more.`}
        onPointerLeave={() => setHover(null)}
      >
        <g>
          {MAP.states.map((s) => (
            <path
              key={s.name}
              ref={(el) => { statePaths.current[s.name] = el; }}
              d={s.d}
              className={"map-state" + (selected === s.name ? " is-selected" : "")}
              vectorEffect="non-scaling-stroke"
              onClick={() => onSelect(selected === s.name ? null : s.name)}
            />
          ))}
        </g>
        {showDistrictShapes && (
          <g className="map-districts" pointerEvents="none">
            {MAP.districts.map((d, i) => d.state === selected && <path key={i} d={d.d} vectorEffect="non-scaling-stroke" />)}
          </g>
        )}
        <g>
          {MAP.districts.map((d, i) => {
            const v = values[i];
            const t = (Math.log(Math.max(v, min)) - Math.log(min)) / Math.max(0.0001, Math.log(Math.max(max, min + 1)) - Math.log(min));
            const r = (1.5 + 2.2 * t) * zoom;
            const dim = selected !== null && d.state !== selected;
            return (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={r}
                className={`map-dot c${step(v)}` + (dim ? " is-dim" : "") + (hover?.i === i ? " is-hover" : "")}
                onPointerEnter={(e) => move(e, i)}
                onPointerMove={(e) => move(e, i)}
                onPointerLeave={() => setHover(null)}
                onClick={() => onSelect(selected === d.state ? null : d.state)}
              />
            );
          })}
        </g>
        <g pointerEvents="none">
          {pings.map((p) => {
            const d = MAP.districts[p.district];
            return <circle key={p.id} cx={d.x} cy={d.y} r={3 * zoom} className="map-ping" style={{ ["--pr" as string]: `${14 * zoom}px` }} />;
          })}
        </g>
      </svg>

      <div className="map-controls">
        {selected && (
          <button className="btn btn-ghost btn-sm" onClick={() => onSelect(null)}>
            <Icon name="reset" size={16} /> All India
          </button>
        )}
      </div>

      <div className="map-legend" aria-hidden="true">
        <span>{fmtNum(min)}</span>
        <span className="map-legend-bar">{Array.from({ length: STEPS }, (_, i) => <i key={i} className={`c${i}`} />)}</span>
        <span>{fmtNum(max)}</span>
      </div>

      {hover && hd && (
        <div className="map-tip" style={{ left: Math.min(hover.x + 12, (wrap.current?.clientWidth ?? 300) - 170), top: Math.max(hover.y - 62, 4) }}>
          <b>{hd.name}</b>
          <span>{hd.state}</span>
          <span className="mono">{fmtNum(values[hover.i])} {unit}</span>
          <span className="mono">{fmtNum(today[hover.i])} today</span>
        </div>
      )}
    </div>
  );
}

export const IndiaMap = memo(IndiaMapImpl);
