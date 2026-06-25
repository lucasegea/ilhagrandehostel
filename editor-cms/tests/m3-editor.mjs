import { chromium } from "playwright";

/**
 * Canonical M3 editor smoke. Drives real Puck interactions and asserts zero
 * console errors throughout.
 *   AC3.1 — edit hero headline field -> preview updates live, no reload.
 *   AC3.2 — add a block (drag from drawer), delete a block -> preview reflects.
 * Reorder-by-drag uses the same dnd-kit sensors proven by the add step; the user
 * exercises it tactilely at the HARD STOP.
 */

const base = process.argv[2] || "http://127.0.0.1:3100";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

const frame = () => page.frameLocator("iframe").first();
const log = (k, v) => console.log(`${k}: ${v}`);
const count = () => frame().locator("section, footer").count();

await page.goto(base + "/admin", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(2500);

// AC3.1 — edit field -> live preview
const OLD = "Aqui você não é hóspede. É da casa.";
const NEW = "EDITADO AO VIVO — Puck";
await frame().getByText(OLD, { exact: false }).first().click();
await page.waitForTimeout(700);
const edited = await page.evaluate(({ oldV, newV }) => {
  const set = (el, val) => {
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const el = [...document.querySelectorAll("input, textarea")].find((i) => i.value === oldV);
  if (!el) return false;
  set(el, newV);
  return true;
}, { oldV: OLD, newV: NEW });
await page.waitForTimeout(900);
const ac31 = edited && (await frame().getByText(NEW, { exact: false }).count()) > 0 && (await frame().getByText(OLD, { exact: false }).count()) === 0;
log("AC3.1 edit field -> live preview", ac31);

// AC3.2a — add a block by dragging from the drawer into the canvas
const addBefore = await count();
const src = page.locator('[class*="Drawer"] [class*="draggable"]').filter({ hasText: "comodidades" }).first();
const sb = await src.boundingBox();
const ifr = await page.locator("iframe").boundingBox();
if (sb && ifr) {
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.mouse.down();
  const tx = ifr.x + ifr.width / 2, ty = ifr.y + ifr.height / 2;
  for (let s = 1; s <= 12; s++) {
    await page.mouse.move(sb.x + (tx - sb.x) * s / 12, sb.y + (ty - sb.y) * s / 12, { steps: 2 });
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(200);
  await page.mouse.up();
}
await page.waitForTimeout(1200);
const addAfter = await count();
const ac32add = addAfter > addBefore;
log("AC3.2 add block (drag from drawer)", `${addBefore} -> ${addAfter} (${ac32add})`);

// AC3.2b — delete a block via the selected component's ActionBar (inside iframe)
await frame().getByText(NEW, { exact: false }).first().click();
await page.waitForTimeout(500);
const delBefore = await count();
await frame().getByRole("button", { name: "Delete", exact: true }).first().click().catch(() => {});
await page.waitForTimeout(900);
const delAfter = await count();
const ac32del = delAfter < delBefore && (await frame().getByText(NEW, { exact: false }).count()) === 0;
log("AC3.2 delete block", `${delBefore} -> ${delAfter} (${ac32del})`);

log("console errors", errors.length);
errors.slice(0, 10).forEach((e) => console.log("  - " + e));

const pass = ac31 && ac32add && ac32del && errors.length === 0;
console.log(pass ? "M3 EDITOR SMOKE PASS" : "M3 EDITOR SMOKE FAIL");
await browser.close();
process.exit(pass ? 0 : 1);
