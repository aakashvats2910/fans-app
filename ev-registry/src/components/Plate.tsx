import { QR } from "./QR";

/** Placeholder mark for syfr.live (swap in the real logo asset when available). */
export function CompanyMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="syfr.live logo" style={{ flex: "none" }}>
      <circle cx="20" cy="20" r="20" fill="#16a34a" />
      <text x="20" y="28.5" textAnchor="middle" fontFamily="Sora, 'Public Sans', system-ui, sans-serif" fontWeight="800" fontSize="26" fill="#fff">s</text>
    </svg>
  );
}

const SIZES = {
  sm: { mark: 22, qr: 32, word: false },
  md: { mark: 32, qr: 56, word: true },
  lg: { mark: 46, qr: 96, word: true },
} as const;

/**
 * The plate on the bike. Non-RTO bikes carry no printed registration number on the plate:
 * it shows the company logo and a QR code that opens the vehicle record. The registration
 * number is printed beneath it for people who need to type it.
 */
export function Plate({ regNo, size = "md" }: { regNo: string; size?: "sm" | "md" | "lg" }) {
  const s = SIZES[size];
  return (
    <span className={`plate-wrap plate-wrap-${size}`}>
      <span className={`plate plate-${size}`} role="img" aria-label={`Number plate with syfr.live logo and QR code for ${regNo}`}>
        <span className="plate-logo">
          <CompanyMark size={s.mark} />
          {s.word && (
            <span className="plate-word">
              <b>
                syfr<i>.live</i>
              </b>
              <small>SMART QR STICKERS</small>
            </span>
          )}
        </span>
        <QR regNo={regNo} size={s.qr} label="" />
      </span>
      <span className="plate-no mono">{regNo}</span>
    </span>
  );
}
