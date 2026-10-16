export type PartKind = "motor" | "controller" | "battery";
export type Role = "company" | "dealer" | "owner";
export type WarrantyStatus = "active" | "expiring" | "expired";

export interface Part {
  serial: string;
  installedOn: string; // ISO date
  warrantyMonths: number;
}

export interface Replacement {
  id: string;
  date: string; // ISO date
  part: PartKind;
  oldSerial: string;
  newSerial: string;
  reason: string;
  dealerId: string;
}

export interface Dealer {
  id: string;
  name: string;
  district: number; // index into MAP.districts
  phone: string;
}

export interface Vehicle {
  id: string; // registration number, also the QR payload
  model: string;
  colour: string;
  chassis: string;
  dealerId: string;
  district: number;
  owner: { name: string; phone: string };
  registeredAt: string; // ISO datetime
  validYears: number;
  parts: Record<PartKind, Part>;
  history: Replacement[];
}

export interface MapDistrict {
  name: string;
  state: string;
  x: number;
  y: number;
  d: string;
}
export interface MapState {
  name: string;
  d: string;
  c: [number, number];
}
export interface MapData {
  width: number;
  height: number;
  states: MapState[];
  districts: MapDistrict[];
}
