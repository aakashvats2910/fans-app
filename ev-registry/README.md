# EV Pehchaan

Dummy-data front end (maker: Ereganto) for a registry of non-RTO, low-speed electric bikes in India. Three roles:

- **Company**: live India map with district-wise circles (deeper shade = more registrations),
  area-wise report, and warranty register for every vehicle.
- **Dealer** (mobile/tablet first): register a vehicle before sale, scan the QR on a plate,
  see warranty and parts history, log a part replacement.
- **Vehicle owner** (mobile first): registration period, warranty per part, parts replaced.

Parts tracked: motor (motor number), controller (serial), battery (serial).

Everything is generated in the browser (`src/data/seed.ts`); new registrations arrive every few
seconds to simulate real time. No backend, no Docker.

## Run

```bash
cd ev-registry
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ — host anywhere (Netlify, Vercel, GitHub Pages, S3…)
```

## Notes

- The QR codes are real. The dealer scanner uses the camera where the browser allows it (needs
  HTTPS or localhost), and also accepts a photo of a QR or a typed registration number.
- District map data comes from `scripts/build-map.mjs` (boundaries from
  [udit-001/india-maps-data](https://github.com/udit-001/india-maps-data)); the output is committed
  as `src/data/indiaMap.json`, so you only re-run `npm run map` to change it.
- `npm run artifact` (after a build) packs the app into one HTML fragment for single-page hosts.
