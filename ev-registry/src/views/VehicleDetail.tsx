import { useState } from "react";
import type { PartKind } from "../types";
import { HistoryTimeline, PartsGrid, RegistrationCard, ReplaceSheet } from "../components/VehicleBits";
import { SectionTitle } from "../components/ui";
import { Icon } from "../components/Icon";
import { MAP, dealerById } from "../data/seed";
import { maskPhone } from "../lib";
import { useStore } from "../store";

/** Everything about one vehicle: registration, warranty per part, replacement history. */
export function VehicleDetail({ id, dealerId }: { id: string; dealerId?: string }) {
  const { byId } = useStore();
  const [replace, setReplace] = useState<PartKind | null>(null);
  const v = byId(id);
  if (!v) return <div className="empty"><Icon name="alert" size={28} /><b>Vehicle not found</b><span className="muted">{id} is not in the registry.</span></div>;
  const dealer = dealerById(v.dealerId);
  return (
    <div className="stack-lg detail">
      <RegistrationCard vehicle={v} />
      <section>
        <SectionTitle aside={<span className="muted small">Owner {v.owner.name} · {maskPhone(v.owner.phone)}</span>}>Parts and warranty</SectionTitle>
        <PartsGrid vehicle={v} onReplace={dealerId ? setReplace : undefined} />
      </section>
      <section className="card">
        <SectionTitle aside={<span className="muted small">{v.history.length} replacement{v.history.length === 1 ? "" : "s"}</span>}>Parts replaced</SectionTitle>
        <HistoryTimeline vehicle={v} />
      </section>
      <p className="muted small">Sold by {dealer.name}, {MAP.districts[dealer.district].name}.</p>
      {replace && dealerId && <ReplaceSheet vehicle={v} initial={replace} dealerId={dealerId} onClose={() => setReplace(null)} />}
    </div>
  );
}
