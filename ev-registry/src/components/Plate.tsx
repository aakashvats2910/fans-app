import { plateParts } from "../lib";

/** The registration plate, styled like the plate on the bike. */
export function Plate({ regNo, size = "md" }: { regNo: string; size?: "sm" | "md" | "lg" }) {
  const [ev, st, yr, num] = plateParts(regNo);
  return (
    <div className={`plate plate-${size}`} aria-label={`Registration number ${regNo}`}>
      <span className="plate-tag">{ev}</span>
      <span className="plate-main">
        <span>{st}</span>
        <span>{yr}</span>
        <span>{num}</span>
      </span>
    </div>
  );
}
