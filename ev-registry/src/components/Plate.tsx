import { QR } from "./QR";
import logo from "../assets/neovolt-logo.png";
import mark from "../assets/neovolt-mark.png";

const SIZES = {
  sm: { logo: 0, mark: 28, qr: 34 },
  md: { logo: 54, mark: 0, qr: 58 },
  lg: { logo: 92, mark: 0, qr: 96 },
} as const;

/**
 * The plate on the bike. Non-RTO bikes carry no printed registration number on the plate:
 * it shows the maker's logo (NeoVolt) and a QR code that opens the vehicle record. The
 * registration number is printed beneath it for people who need to type it.
 */
export function Plate({ regNo, size = "md" }: { regNo: string; size?: "sm" | "md" | "lg" }) {
  const s = SIZES[size];
  return (
    <span className={`plate-wrap plate-wrap-${size}`}>
      <span className={`plate plate-${size}`} role="img" aria-label={`Number plate with NeoVolt logo and QR code for ${regNo}`}>
        {s.logo ? (
          <img className="plate-logo" src={logo} alt="" style={{ height: s.logo }} />
        ) : (
          <img className="plate-logo" src={mark} alt="" style={{ height: s.mark }} />
        )}
        <QR regNo={regNo} size={s.qr} label="" />
      </span>
      <span className="plate-no mono">{regNo}</span>
    </span>
  );
}
