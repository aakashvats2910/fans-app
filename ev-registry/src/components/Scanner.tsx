import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Icon } from "./Icon";
import { extractRegNo } from "../lib";
import { QR } from "./QR";
import type { Vehicle } from "../types";

interface Props {
  onFound: (regNo: string) => void;
  demo: Vehicle[];
  knows: (regNo: string) => boolean;
}

/** QR scanner: live camera when the browser allows it, photo upload and manual entry otherwise. */
export function Scanner({ onFound, demo, knows }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<"idle" | "starting" | "on" | "off">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);

  const handle = (text: string) => {
    const reg = extractRegNo(text);
    if (!reg) return setMsg("That QR code is not an Zelio plate.");
    if (!knows(reg)) return setMsg(`${reg} is not in the registry. Check the number and try again.`);
    setMsg(null);
    onFound(reg);
  };

  const stop = () => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCam("idle");
  };
  useEffect(() => stop, []);

  const start = async () => {
    setMsg(null);
    if (!navigator.mediaDevices?.getUserMedia) { setCam("off"); setMsg("Camera is not available in this browser. Upload a photo of the plate instead."); return; }
    setCam("starting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      stream.current = s;
      const v = video.current!;
      v.srcObject = s;
      await v.play();
      setCam("on");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const loop = () => {
        if (v.readyState >= 2 && v.videoWidth) {
          canvas.width = v.videoWidth; canvas.height = v.videoHeight;
          ctx.drawImage(v, 0, 0);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (code?.data && extractRegNo(code.data)) { stop(); handle(code.data); return; }
        }
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      setCam("off");
      setMsg("Camera permission was blocked or is unavailable here. Upload a photo of the plate instead.");
    }
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
      c.width = img.width * scale; c.height = img.height * scale;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(d.data, d.width, d.height);
      URL.revokeObjectURL(url);
      code ? handle(code.data) : setMsg("No QR code found in that photo. Move closer and keep the plate flat.");
    };
    img.src = url;
  };

  return (
    <div className="scanner">
      <div className={"viewfinder" + (cam === "on" ? " is-on" : "")}>
        <video ref={video} playsInline muted />
        {cam !== "on" && (
          <div className="viewfinder-idle">
            <Icon name="qr" size={44} />
            <p>Point the camera at the QR on the bike's number plate.</p>
          </div>
        )}
        <i className="vf-corner tl" /><i className="vf-corner tr" /><i className="vf-corner bl" /><i className="vf-corner br" />
        {cam === "on" && <span className="vf-line" />}
      </div>

      <div className="row wrap gap-sm">
        {cam === "on" ? (
          <button className="btn" onClick={stop}>Stop camera</button>
        ) : (
          <button className="btn btn-primary" onClick={start} disabled={cam === "starting"}>
            <Icon name="camera" size={18} /> {cam === "starting" ? "Starting…" : "Scan with camera"}
          </button>
        )}
        <label className="btn" htmlFor="qr-file">
          <Icon name="image" size={18} /> Upload photo
          <input id="qr-file" type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
      </div>

      {msg && <p className="notice notice-warn" role="status"><Icon name="alert" size={18} /> {msg}</p>}

      <form
        className="field-row"
        onSubmit={(e) => { e.preventDefault(); handle(manual); }}
      >
        <div className="field grow">
          <label htmlFor="manual-reg">Or type the registration number</label>
          <input id="manual-reg" className="input mono" placeholder="EV-UP-26-004201" value={manual} autoCapitalize="characters"
            onChange={(e) => setManual(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={!manual.trim()}>Look up</button>
      </form>

      <section className="demo-plates">
        <h3>Demo plates</h3>
        <p className="muted small">These are real QR codes. Scan one from another screen, or tap to simulate the scan.</p>
        <div className="demo-grid">
          {demo.map((v) => (
            <button key={v.id} className="demo-plate" onClick={() => onFound(v.id)}>
              <QR regNo={v.id} size={92} />
              <span className="mono small">{v.id}</span>
              <span className="muted small">{v.model}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
