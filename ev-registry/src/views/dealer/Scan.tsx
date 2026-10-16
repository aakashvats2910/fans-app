import { Scanner } from "../../components/Scanner";
import { useStore } from "../../store";

export function ScanPage({ dealerId, open }: { dealerId: string; open: (id: string) => void }) {
  const { vehicles, byId } = useStore();
  const demo = vehicles.filter((v) => v.dealerId === dealerId).slice(0, 3);
  return (
    <div className="stack-lg scan-page">
      <div>
        <h2 className="page-title">Scan plate QR</h2>
        <p className="muted">Opens the full record: registration, warranty on every part and the parts replaced so far.</p>
      </div>
      <section className="card">
        <Scanner onFound={open} demo={demo} knows={(r) => !!byId(r)} />
      </section>
    </div>
  );
}
