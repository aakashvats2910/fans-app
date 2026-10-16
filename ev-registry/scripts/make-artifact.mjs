// Packs the Vite build into one self-contained HTML fragment (.artifact/page.html) for hosts that
// take a single page, such as a claude.ai artifact. Run `npm run build` first.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const jsFile = html.match(/src="\.\/(assets\/[^"]+\.js)"/)[1];
const cssFile = html.match(/href="\.\/(assets\/[^"]+\.css)"/)[1];
const fonts = html.match(/<link\s+rel="stylesheet"\s+href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1];
const js = readFileSync(`dist/${jsFile}`, "utf8").replace(/<\/script/gi, "<\\/script");
const css = readFileSync(`dist/${cssFile}`, "utf8");

mkdirSync(".artifact", { recursive: true });
writeFileSync(
  ".artifact/page.html",
  `<title>EV Pehchaan</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="${fonts}">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`,
);
console.log("wrote .artifact/page.html", Math.round((css.length + js.length) / 1024), "KB");
