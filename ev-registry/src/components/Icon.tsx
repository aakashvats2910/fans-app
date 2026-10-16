const P: Record<string, string> = {
  home: "M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5",
  map: "M9 4 3.5 6v14L9 18m0-14 6 2m-6-2v14m6-12 5.5-2v14L15 20m0-14v14",
  table: "M4 5h16v14H4zM4 10h16M4 15h16M10 5v14",
  shield: "M12 3.5 5 6v5.5c0 4.2 2.7 7.4 7 9 4.3-1.6 7-4.8 7-9V6l-7-2.5Zm-3 8.5 2.2 2.2L15.5 10",
  scan: "M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16",
  plus: "M12 5v14M5 12h14",
  bike: "M6 18.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm12 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM6 15l3.5-6.5h4L16 15m-6.5-6.5L8.5 6H7m6.5 2.5L18 15",
  battery: "M3.5 8h14v8h-14zM20 10.5v3M7 11v2M10.5 11v2M14 11v2",
  motor: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-11v2.5M12 17.5V20M4 12h2.5M17.5 12H20M6.3 6.3l1.8 1.8M15.9 15.9l1.8 1.8M6.3 17.7l1.8-1.8M15.9 8.1l1.8-1.8",
  chip: "M8 8h8v8H8zM10 4v4M14 4v4M10 16v4M14 16v4M4 10h4M4 14h4M16 10h4M16 14h4",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4.5 4.5",
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
  sun: "M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-13v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6",
  moon: "M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z",
  swap: "M7 7h12m-3-3 3 3-3 3M17 17H5m3-3-3 3 3 3",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 4 3 19.5h18L12 4Zm0 6v4.5m0 2.5v.1",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.5-3.6 3.3-5.5 7-5.5s6.5 1.9 7 5.5",
  store: "M4 9.5 5.5 4.5h13L20 9.5M4 9.5c0 1.4 1.1 2.5 2.5 2.5S9 10.9 9 9.5c0 1.4 1.1 2.5 2.5 2.5h1c1.4 0 2.5-1.1 2.5-2.5 0 1.4 1.1 2.5 2.5 2.5S20 10.9 20 9.5M5.5 12v7.5h13V12",
  clock: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4.5l3 1.5",
  pin: "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Zm0-8.2a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z",
  wrench: "M14.5 6.5a4 4 0 0 0 4.8 4.8L21 13l-3 3-1.7-1.7-8.1 8.1-3-3 8.1-8.1L11.5 9.5l3-3Z",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2.5v2.5H14zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z",
  camera: "M4 8h3l1.5-2.5h7L17 8h3v11H4zM12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z",
  image: "M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 3-3L20 16M9 9.5h.01",
  copy: "M8 8h11v12H8zM5 16V4h11",
  filter: "M4 6h16M7 12h10M10 18h4",
  zoomIn: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4.5 4.5M11 8v6M8 11h6",
  reset: "M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4",
  building: "M5 20V5h9v15M14 10h5v10M5 20h14M8.5 8.5h2M8.5 12h2M8.5 15.5h2",
  logout: "M10 4H5.5v16H10M14 8l4 4-4 4M18 12H9",
  pulse: "M3 12h4l2.5-6 4 12 2.5-6H21",
};

export function Icon({ name, size = 20, className }: { name: keyof typeof P | string; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={P[name] ?? P.pulse} />
    </svg>
  );
}
