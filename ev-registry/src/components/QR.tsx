import { useMemo } from "react";
import qrcode from "qrcode-generator";
import { qrPayload } from "../lib";

/** Real, scannable QR code (rendered as SVG). Encodes the vehicle's registration link. */
export function QR({ regNo, size = 140, label }: { regNo: string; size?: number; label?: string }) {
  const { d, n } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(qrPayload(regNo));
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x + 2},${y + 2}h1v1h-1z`;
    return { d, n };
  }, [regNo]);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${n + 4} ${n + 4}`}
      role="img"
      aria-label={label ?? `QR code for ${regNo}`}
      shapeRendering="crispEdges"
      style={{ background: "#fff", borderRadius: 8, maxWidth: "100%", height: "auto" }}
    >
      <path d={d} fill="#0f1f1a" />
    </svg>
  );
}
