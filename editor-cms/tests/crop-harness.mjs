import { chromium } from "playwright";
import { PNG } from "pngjs";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Crop UI + bake + upload-wiring smoke (recorte real, D-crop). Drives the dev-only
 * /crop-harness headless: pick a known 800x600 fixture, confirm the cropper appears
 * BEFORE any upload, drag a handle to shrink the rectangle, confirm, and assert the
 * intercepted (stubbed) upload blob carries the CROPPED dimensions, not the original's.
 * Then the cancel path (no upload, prior value intact) and the forced-error path
 * (fail-clear, prior value intact). Zero console.error tolerated on the happy path.
 * Run (dev server up on :3200, NODE_ENV=development): npx tsx tests/crop-harness.mjs
 */

const BASE = process.argv[2] || "http://127.0.0.1:3200/crop-harness";
const NAT_W = 800;
const NAT_H = 600;

// Build a distinct 800x600 PNG fixture in a temp file (no working-tree artifact).
async function makeFixture() {
  const png = new PNG({ width: NAT_W, height: NAT_H });
  for (let y = 0; y < NAT_H; y++) {
    for (let x = 0; x < NAT_W; x++) {
      const i = (y * NAT_W + x) << 2;
      png.data[i] = (x * 255 / NAT_W) | 0;
      png.data[i + 1] = (y * 255 / NAT_H) | 0;
      png.data[i + 2] = 128;
      png.data[i + 3] = 255;
    }
  }
  const dir = join(tmpdir(), "crop-harness-fixture");
  await mkdir(dir, { recursive: true });
  const path = join(dir, "crop-src.png");
  await writeFile(path, PNG.sync.write(png));
  return { path, dir };
}

const checks = [];
const ok = (name, cond) => { checks.push([name, !!cond]); };

const { path: FIXTURE, dir: FIXDIR } = await makeFixture();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 700, height: 900 } });

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

async function reset() {
  await page.evaluate(() => {
    const w = window;
    w.__lastUpload = undefined;
    w.__uploadCount = 0;
    w.__forceUploadError = false;
  });
}

await page.goto(BASE, { waitUntil: "networkidle", timeout: 45000 });

const fileInput = page.locator('input[type="file"]');
const fieldValue = page.locator('[data-testid="field-value"]');
const initialValue = await fieldValue.textContent();

// ---- AC-T2.1: pick opens the cropper and does NOT upload yet ----
await reset();
await fileInput.setInputFiles(FIXTURE);
await page.waitForSelector('[data-testid="cropper"]', { timeout: 5000 });
const rect = page.locator('[data-testid="crop-rect"]');
await rect.waitFor({ timeout: 5000 });
const uploadCountAfterPick = await page.evaluate(() => window.__uploadCount);
ok("AC-T2.1 picking a raster file opens the cropper", await page.locator('[data-testid="cropper"]').isVisible());
ok("AC-T2.1 no upload fired on pick (upload is post-crop)", uploadCountAfterPick === 0);

// ---- AC-T2.2: the crop rectangle is adjustable (drag the SE handle to shrink) ----
const w0 = Number(await rect.getAttribute("data-w"));
const h0 = Number(await rect.getAttribute("data-h"));
const seBox = await page.locator('[data-testid="handle-se"]').boundingBox();
await page.mouse.move(seBox.x + seBox.width / 2, seBox.y + seBox.height / 2);
await page.mouse.down();
await page.mouse.move(seBox.x - 120, seBox.y - 90, { steps: 8 });
await page.mouse.up();
const w1 = Number(await rect.getAttribute("data-w"));
const h1 = Number(await rect.getAttribute("data-h"));
ok("AC-T2.2 dragging the SE handle changes the rectangle dimensions", w1 < w0 && h1 < h0);

// expected source dims for the (now shrunk) rect, via the same scale the helper uses
const dispBox = await page.locator('[data-testid="cropper"] img').boundingBox();
const expW = Math.round(w1 * (NAT_W / dispBox.width));
const expH = Math.round(h1 * (NAT_H / dispBox.height));

// ---- AC-T3.1: confirm uploads the CROPPED blob (dims match the rect, not the original) ----
await page.locator('[data-testid="crop-confirm"]').click();
await page.waitForFunction(() => window.__lastUpload !== undefined, { timeout: 8000 });
const up = await page.evaluate(() => window.__lastUpload);
ok("AC-T3.1 upload fired exactly once after confirm", (await page.evaluate(() => window.__uploadCount)) === 1);
ok(`AC-T3.1 baked blob width matches the crop rect (got ${up.w}, expected ~${expW})`, Math.abs(up.w - expW) <= 2);
ok(`AC-T3.1 baked blob height matches the crop rect (got ${up.h}, expected ~${expH})`, Math.abs(up.h - expH) <= 2);
ok("AC-T3.1 baked blob is SMALLER than the original (proves crop, not passthrough)", up.w < NAT_W && up.h < NAT_H);
ok("AC-T3.1 baked blob is a token-allowed image type (png preserved)", up.type === "image/png");
ok("AC-T3.1 cropper closed and field value updated to the uploaded url", (await fieldValue.textContent())?.startsWith("blob:"));

// ---- AC-T2.3: cancel closes the cropper, no upload, prior value intact ----
await reset();
const valueBeforeCancel = await fieldValue.textContent();
await fileInput.setInputFiles(FIXTURE);
await page.waitForSelector('[data-testid="cropper"]', { timeout: 5000 });
await page.locator('[data-testid="crop-cancel"]').click();
await page.waitForSelector('[data-testid="cropper"]', { state: "detached", timeout: 5000 });
ok("AC-T2.3 cancel fired no upload", (await page.evaluate(() => window.__uploadCount)) === 0);
ok("AC-T2.3 cancel kept the prior field value (never blanked)", (await fieldValue.textContent()) === valueBeforeCancel);

// ---- AC-T3.2: a forced upload error is fail-clear, prior value intact ----
await reset();
await page.evaluate(() => { window.__forceUploadError = true; });
const valueBeforeError = await fieldValue.textContent();
await fileInput.setInputFiles(FIXTURE);
await page.waitForSelector('[data-testid="cropper"]', { timeout: 5000 });
await page.locator('[data-testid="crop-confirm"]').click();
await page.waitForSelector("text=upload falhou (stub)", { timeout: 8000 });
ok("AC-T3.2 upload error surfaces a readable message", await page.locator("text=upload falhou (stub)").isVisible());
ok("AC-T3.2 upload error kept the prior field value (fail-clear, no blank)", (await fieldValue.textContent()) === valueBeforeError);

await browser.close();
await rm(FIXDIR, { recursive: true, force: true });

ok("zero console errors on the happy path", consoleErrors.length === 0);
if (consoleErrors.length) console.log("console errors:\n  " + consoleErrors.join("\n  "));

let pass = true;
for (const [name, good] of checks) {
  console.log(`${good ? "PASS" : "FAIL"}  ${name}`);
  if (!good) pass = false;
}
console.log(`${checks.filter((c) => c[1]).length}/${checks.length} checks passed`);
console.log(pass ? "CROP HARNESS PASS" : "CROP HARNESS FAIL");
process.exit(pass ? 0 : 1);
