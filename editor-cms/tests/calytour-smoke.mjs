import { chromium } from "playwright";

/**
 * Happy-path browser smoke for the Calytour second-site build (Section D, lesson
 * 2026-05-02b). Asserts the public /calytour content renders, the hostel / still
 * renders (regression), the multi-site admin loads for calytour, and an unknown site
 * is rejected fail-clear. Captures console.error + pageerror on every page.
 */

const BASE = process.argv[2] || "http://127.0.0.1:3200";
const SHOT = process.argv[3] || "calytour.png";

async function visit(browser, path, { waitMs = 0 } = {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));
  const resp = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
  if (waitMs) await page.waitForTimeout(waitMs);
  const status = resp ? resp.status() : 0;
  const body = await page.content();
  return { page, errors, status, body };
}

function must(cond, label, fails) {
  if (!cond) fails.push(label);
}

const browser = await chromium.launch();
const fails = [];
let calytourErrors = [];

try {
  // 1. Public /calytour
  {
    const { page, errors, status, body } = await visit(browser, "/calytour");
    calytourErrors = errors;
    must(status === 200, `/calytour status ${status} != 200`, fails);
    must(body.includes("Ajudamos a planejar sua viagem"), "/calytour missing hero headline", fails);
    must(body.includes("O que a gente resolve"), "/calytour missing services heading", fails);
    must(body.includes("Translados"), "/calytour missing service Translados", fails);
    must(body.includes("Quem viajou com a Calytour"), "/calytour missing reviews heading", fails);
    must(body.includes("Thiago R."), "/calytour missing review author", fails);
    must(body.includes("Bora planejar seu roteiro"), "/calytour missing CTA headline", fails);
    must(body.includes("Falar no WhatsApp"), "/calytour missing WhatsApp CTA", fails);
    must(body.includes("Voltar ao hostel"), "/calytour missing back-to-hostel", fails);
    must(body.includes("logo-calytour.jpg"), "/calytour missing calytour logo", fails);
    must(!body.includes("logo-hostel.jpg"), "/calytour leaks hostel logo", fails);
    must(errors.length === 0, `/calytour console errors: ${JSON.stringify(errors)}`, fails);
    await page.screenshot({ path: SHOT, fullPage: true });
    await page.close();
  }

  // 2. Hostel / regression
  {
    const { page, errors, status, body } = await visit(browser, "/");
    must(status === 200, `/ status ${status} != 200`, fails);
    must(body.includes("Ilha Grande Hostel"), "/ missing hostel brand (regression)", fails);
    must(errors.length === 0, `/ console errors: ${JSON.stringify(errors)}`, fails);
    await page.close();
  }

  // 3. Multi-site admin loads for calytour (Puck editor shell)
  {
    const { page, errors, status, body } = await visit(browser, "/admin?site=calytour", { waitMs: 2500 });
    must(status === 200, `/admin?site=calytour status ${status} != 200`, fails);
    const pageerrors = errors.filter((e) => e.startsWith("PAGEERROR"));
    must(pageerrors.length === 0, `/admin?site=calytour JS exceptions: ${JSON.stringify(pageerrors)}`, fails);
    console.log(`  admin console errors (non-fatal, reported): ${JSON.stringify(errors)}`);
    await page.close();
  }

  // 4. Unknown site rejected fail-clear
  {
    const { page, status, body } = await visit(browser, "/admin?site=bogus");
    must(body.includes("Site desconhecido"), "/admin?site=bogus not rejected fail-clear", fails);
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("\n--- Calytour /calytour console errors:", calytourErrors.length);
if (fails.length) {
  console.log("\nSMOKE FAIL:");
  for (const f of fails) console.log("  -", f);
  process.exit(1);
}
console.log("\nSMOKE PASS — all assertions green, screenshot:", SHOT);
process.exit(0);
