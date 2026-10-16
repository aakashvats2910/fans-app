// Builds src/data/indiaMap.json: simplified, projected SVG paths for India's states and
// districts, plus an interior point per district. Source: udit-001/india-maps-data (district
// boundaries). Run: npm run map
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { geoMercator } from "d3-geo";

const SRC = "https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/india.geojson";
const tmp = "scripts/.tmp";
mkdirSync(tmp, { recursive: true });
if (!existsSync(`${tmp}/india.geojson`)) {
  execFileSync("curl", ["-sSL", "-o", `${tmp}/india.geojson`, SRC], { stdio: "inherit" });
}
const mapshaper = (args) => execFileSync("npx", ["mapshaper", ...args], { stdio: "inherit" });

mapshaper([`${tmp}/india.geojson`, "-simplify", "visvalingam", "6%", "keep-shapes", "-o", `${tmp}/districts.json`, "format=geojson", "force"]);
mapshaper([`${tmp}/india.geojson`, "-filter", "!!district", "-simplify", "visvalingam", "6%", "keep-shapes", "-dissolve", "st_nm", "-o", `${tmp}/states.json`, "format=geojson", "force"]);
mapshaper([`${tmp}/india.geojson`, "-points", "inner", "-o", `${tmp}/points.json`, "format=geojson", "force"]);

const read = (f) => JSON.parse(readFileSync(`${tmp}/${f}`, "utf8"));
const districts = read("districts.json");
const states = read("states.json");
const points = read("points.json");

// Planar projection (Mercator) applied ring by ring, so winding order never matters.
const W = 640;
const merc = geoMercator().scale(1000).translate([0, 0]);
const rings = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates).flat();
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const f of states.features) for (const r of rings(f.geometry)) for (const c of r) {
  const [x, y] = merc(c);
  minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
const k = (W - 8) / (maxX - minX);
const px = (c) => { const [x, y] = merc(c); return [(x - minX) * k + 4, (y - minY) * k + 4]; };
const H = Math.ceil((maxY - minY) * k + 8);
const num = (n) => +n.toFixed(1);
const toPath = (g) =>
  rings(g).map((r) => "M" + r.map((c) => px(c).map(num).join(",")).join("L") + "Z").join("");
const centroid = (g) => {
  let best = null, area = 0;
  for (const poly of g.type === "Polygon" ? [g.coordinates] : g.coordinates) {
    const r = poly[0].map(px); let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) { const f = r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; a += f; cx += (r[i][0] + r[i + 1][0]) * f; cy += (r[i][1] + r[i + 1][1]) * f; }
    a /= 2; if (Math.abs(a) > area) { area = Math.abs(a); best = [cx / (6 * a), cy / (6 * a)]; }
  }
  return best.map(num);
};

const out = {
  width: W,
  height: H,
  states: states.features.map((f) => ({ name: f.properties.st_nm, d: toPath(f.geometry), c: centroid(f.geometry) })),
  // The source also carries one district-less outline feature per state; skip those.
  districts: districts.features.flatMap((f, i) => {
    if (!f.properties.district) return [];
    const p = px(points.features[i].geometry.coordinates);
    return [{ name: f.properties.district, state: f.properties.st_nm, x: num(p[0]), y: num(p[1]), d: toPath(f.geometry) }];
  }),
};
writeFileSync("src/data/indiaMap.json", JSON.stringify(out));
console.log(out.states.length, "states", out.districts.length, "districts", W, H);
