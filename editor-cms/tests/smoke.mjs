import { chromium } from "playwright";

/**
 * Browser-driven smoke (Section D): load a URL, assert HTTP 200, zero console.error,
 * zero pageerror, and that every required string is present in the DOM.
 * Usage: node tests/smoke.mjs <url> [requiredString ...]
 */

const url = process.argv[2] || "http://127.0.0.1:3100/";
const required = process.argv.slice(3);

const browser = await chromium.launch();
const page = await browser.newPage();

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console.error: " + m.text());
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

let status = 0;
try {
  const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  status = resp ? resp.status() : 0;
  await page.waitForTimeout(1500);
} catch (e) {
  errors.push("navigation: " + e.message);
}

const html = await page.content();
const missing = required.filter((s) => !html.includes(s));
await browser.close();

console.log(`url: ${url}`);
console.log(`status: ${status}`);
console.log(`console/page errors: ${errors.length}`);
errors.forEach((e) => console.log("  - " + e));
if (missing.length) console.log(`missing strings: ${missing.join(" | ")}`);

const ok = status === 200 && errors.length === 0 && missing.length === 0;
console.log(ok ? "SMOKE PASS" : "SMOKE FAIL");
process.exit(ok ? 0 : 1);
