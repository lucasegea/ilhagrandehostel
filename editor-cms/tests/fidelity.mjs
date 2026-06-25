import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Visual-fidelity gate (7.D, lesson 2026-06-09e). EXTERNAL baseline: a screenshot of
 * proposals/conceito-1/index.html (the mockup), NOT a self-capture. The conceito1 render
 * is seeded with the same demo content (/fidelity-harness) so the only diff is SHAPE.
 * Per-section pixel diff via pixelmatch + a teeth test that proves the gate detects a
 * regression. Reports honest numbers; thresholds are defensible, not self-baselined.
 */

const HARNESS = process.argv[2] || "http://127.0.0.1:3200/fidelity-harness";
const __dirname = dirname(fileURLToPath(import.meta.url));
const MOCKUP = pathToFileURL(
  resolve(__dirname, "../../proposals/conceito-1/index.html")
).href;

const WIDTH = 1280;
const THRESHOLD = 0.1; // per-pixel color tolerance (absorbs AA / font-hinting noise)
const SECTION_PASS = 0.06; // <=6% mismatched pixels per section = faithful

// section key -> [mockup selector, render selector]
const SECTIONS = [
  ["hero", ".hero", "#topo"],
  ["a-casa", "#a-casa", "#a-casa"],
  ["vozes", "#vozes", "#vozes"],
  ["quartos", "#quartos", "#quartos"],
  ["comodidades", "#comodidades", "#comodidades"],
  ["experiencias", "#experiencias", "#experiencias"],
  ["calytour", "#calytour", "#calytour"],
  ["galeria", "#galeria", "#galeria"],
  ["localizacao", "#localizacao", "#localizacao"],
  ["reservar", "#reservar", "#reservar"],
  ["footer", ".site-footer", "footer"],
];

function crop(png, w, h) {
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    const srcStart = y * png.width * 4;
    const dstStart = y * w * 4;
    png.data.copy(out.data, dstStart, srcStart, srcStart + w * 4);
  }
  return out;
}

// Mismatch ratio of two PNG buffers, compared over their common top-left region.
function diffRatio(bufA, bufB) {
  const a = PNG.sync.read(bufA);
  const b = PNG.sync.read(bufB);
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const ca = a.width === w && a.height === h ? a : crop(a, w, h);
  const cb = b.width === w && b.height === h ? b : crop(b, w, h);
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: THRESHOLD });
  return { ratio: n / (w * h), w, h, ha: a.height, hb: b.height };
}

async function shot(page, sel) {
  const el = await page.$(sel);
  if (!el) return null;
  return await el.screenshot();
}

async function loadFull(browser, url) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  return page;
}

const browser = await chromium.launch();
const mock = await loadFull(browser, MOCKUP);
const rend = await loadFull(browser, HARNESS);

console.log(`baseline (external): ${MOCKUP}`);
console.log(`render  (seeded):    ${HARNESS}`);
console.log("");
console.log("section          mismatch   mockup_h  render_h  verdict");
console.log("---------------- ---------- --------- --------- -------");

let worst = 0;
const rows = [];
for (const [key, ms, rs] of SECTIONS) {
  const a = await shot(mock, ms);
  const b = await shot(rend, rs);
  if (!a || !b) {
    rows.push([key, "MISSING", "-", "-", "FAIL"]);
    worst = 1;
    continue;
  }
  const { ratio, ha, hb } = diffRatio(a, b);
  worst = Math.max(worst, ratio);
  const verdict = ratio <= SECTION_PASS ? "ok" : "OVER";
  rows.push([key, (ratio * 100).toFixed(2) + "%", ha, hb, verdict]);
}
for (const [k, m, ha, hb, v] of rows) {
  console.log(`${k.padEnd(16)} ${String(m).padStart(9)} ${String(ha).padStart(9)} ${String(hb).padStart(9)}  ${v}`);
}

// --- teeth test: the gate must flag a regression and pass a clean comparison ---
const heroA = await shot(mock, ".hero");
const cleanRatio = diffRatio(heroA, heroA).ratio; // identical buffer -> ~0
await rend.evaluate(() => {
  const t = document.querySelector("#topo");
  if (t) {
    const o = document.createElement("div");
    o.style.cssText =
      "position:absolute;inset:0;background:#ff0000;z-index:9999;";
    t.style.position = "relative";
    t.appendChild(o);
  }
});
await rend.waitForTimeout(200);
const heroCorrupt = await shot(rend, "#topo");
const corruptRatio = diffRatio(heroA, heroCorrupt).ratio;
const teethPass = cleanRatio < 0.001 && corruptRatio > 0.5;

console.log("");
console.log(`teeth: clean-vs-clean=${(cleanRatio * 100).toFixed(3)}% (want <0.1%), ` +
  `overlay-regression=${(corruptRatio * 100).toFixed(1)}% (want >50%) -> ${teethPass ? "HAS TEETH" : "NO TEETH"}`);

await browser.close();

const sectionsPass = rows.every((r) => r[4] === "ok");
console.log("");
console.log(`worst section mismatch: ${(worst * 100).toFixed(2)}% (pass bar <= ${(SECTION_PASS * 100)}%)`);
const pass = sectionsPass && teethPass;
console.log(pass ? "FIDELITY PASS" : "FIDELITY REVIEW");
process.exit(pass ? 0 : 1);
