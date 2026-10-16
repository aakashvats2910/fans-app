import { QR } from "./QR";

/** Dummy company mark (Voltio Motors). */
export function CompanyMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Voltio Motors logo" style={{ flex: "none" }}>
      <circle cx="20" cy="20" r="20" fill="#0a6b4e" />
      <path d="M10.5 12.5 20 29.5l9.5-17" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.6 6.5 16.4 16h3.9l-1.4 6.2 5.7-9.6h-3.9l.9-6.1Z" fill="#f6c90e" stroke="#0a6b4e" strokeWidth="1" strokeLinejoin="round" />
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
      <span className={`plate plate-${size}`} role="img" aria-label={`Number plate with Voltio Motors logo and QR code for ${regNo}`}>
        <span className="plate-logo">
          <CompanyMark size={s.mark} />
          {s.word && (
            <span className="plate-word">
              <b>VOLTIO</b>
              <small>MOTORS</small>
            </span>
          )}
        </span>
        <QR regNo={regNo} size={s.qr} label="" />
      </span>
      <span className="plate-no mono">{regNo}</span>
    </span>
  );
}
