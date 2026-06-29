import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const { savePage } = await import("../lib/content");
const { zPage } = await import("../lib/blocks");
const { isAllowed } = await import("../lib/auth-allowlist.ts");
const { requireBlobToken, IMAGE_CONTENT_TYPES } = await import("../lib/blob-upload.ts");

/**
 * M6 upload contract test (D-106). The client-direct Vercel Blob upload feature is
 * mostly wiring (browser -> Blob -> Puck field -> page.json), so the contract this
 * locks is: a Blob URL survives the publish path into page.json, the auth gate the
 * token route relies on refuses a sessionless/non-allowlisted caller, a missing store
 * token fails clear, and the upload is architecturally client-direct (not a server
 * put()). The live token mint + real Blob PUT need a real session and a real
 * BLOB_READ_WRITE_TOKEN, so they are an operator handoff, not asserted here.
 * Run: npx tsx tests/m6-upload.mjs
 *
 * Like m4, the round-trip case drives the real savePage with a mocked fetch and
 * restores content/ilhagrande/page.json afterward, leaving no working-tree diff.
 */

const checks = [];
const ok = (name, cond) => { checks.push([name, !!cond]); };

// Blob-shaped public URLs, one per image field, so we can prove each lands in page.json.
const B = "https://abc123xyz.public.blob.vercel-storage.com";
const IMG = {
  hero: `${B}/hero-aBcD1234.png`,
  sobre: `${B}/sobre-eFgH5678.jpg`,
  quarto: `${B}/quarto-iJkL9012.webp`,
  exp: `${B}/exp-mNoP3456.png`,
  galeria: `${B}/galeria-qRsT7890.jpg`,
  local: `${B}/local-uVwX1234.png`,
};

// A contract-valid page carrying a Blob URL in each of the six wired image fields.
const fixture = {
  root: { props: { title: "M6 fixture" } },
  content: [
    { type: "hero", props: { id: "h1", headline: "Olá", heroImage: IMG.hero } },
    { type: "sobre", props: { id: "s1", headline: "Sobre", image: IMG.sobre } },
    {
      type: "quartos",
      props: {
        id: "q1",
        headline: "Quartos",
        items: [{ name: "Suíte", image: IMG.quarto }],
      },
    },
    {
      type: "experiencias",
      props: {
        id: "e1",
        headline: "Experiências",
        items: [{ name: "Trilha", image: IMG.exp }],
      },
    },
    {
      type: "galeria",
      props: {
        id: "g1",
        headline: "Galeria",
        images: [{ url: IMG.galeria, alt: "praia" }],
      },
    },
    { type: "localizacao", props: { id: "l1", headline: "Localização", image: IMG.local } },
  ],
};

// --- (a) round-trip: Blob URLs pass zPage.parse and persist into page.json bytes ---

const parsed = zPage.safeParse(fixture);
ok("Blob URLs in all six image fields pass zPage.parse", parsed.success);

const PAGE = resolve(process.cwd(), "content", "ilhagrande", "page.json");
const original = await readFile(PAGE, "utf8");
const realFetch = global.fetch;
try {
  process.env.GITHUB_TOKEN = "test-token"; // exercise the publish path without real GitHub
  let putContent = "";
  global.fetch = async (url, init = {}) => {
    const method = init.method || "GET";
    if (method === "GET") {
      return { ok: true, status: 200, json: async () => ({ sha: "sha123" }), text: async () => "" };
    }
    putContent = JSON.parse(init.body ?? "{}").content ?? "";
    return { ok: true, status: 201, json: async () => ({}), text: async () => "" };
  };

  await savePage("ilhagrande", fixture);

  const persisted = Buffer.from(putContent, "base64").toString("utf8");
  ok(
    "every Blob URL is persisted into the committed page.json",
    Object.values(IMG).every((u) => persisted.includes(u))
  );
  // The persisted bytes must themselves re-parse as a valid page (no lossy serialization).
  ok("persisted page.json re-parses against the contract", zPage.safeParse(JSON.parse(persisted)).success);
} finally {
  global.fetch = realFetch;
  delete process.env.GITHUB_TOKEN;
  await writeFile(PAGE, original, "utf8"); // leave the working tree untouched
}

// --- (b) auth gate: the decision the token route's onBeforeGenerateToken relies on ---
// isAuthorizedEditor() = isAllowed(session?.user?.email, EDITOR_EMAILS); a sessionless
// caller has an undefined email. This is the pure, IO-free core of that gate.
const LIST = "ana@hostel.com";
ok("sessionless caller (undefined email) is refused -> no token", isAllowed(undefined, LIST) === false);
ok("non-allowlisted caller is refused -> no token", isAllowed("intruso@evil.com", LIST) === false);
ok("empty allowlist refuses everyone (fail-clear)", isAllowed("ana@hostel.com", "") === false);
ok("allowlisted editor is authorized -> token may be minted", isAllowed("ana@hostel.com", LIST) === true);

// --- (c) fail-clear: a missing store token throws a readable, named error ---
let threwUnset = false;
try {
  requireBlobToken(undefined);
} catch (e) {
  threwUnset = true;
  ok("missing token error names BLOB_READ_WRITE_TOKEN", /BLOB_READ_WRITE_TOKEN/.test(e.message));
}
ok("requireBlobToken throws when the token is unset", threwUnset);

let threwEmpty = false;
try { requireBlobToken(""); } catch { threwEmpty = true; }
ok("requireBlobToken throws on an empty token (no silent fallback)", threwEmpty);
ok("requireBlobToken returns the token when present", requireBlobToken("vercel_blob_rw_xxx") === "vercel_blob_rw_xxx");

// --- token scope: images only ---
ok("upload token allows only image content types", IMAGE_CONTENT_TYPES.every((t) => t.startsWith("image/")));

// --- AC4 architecture: the upload is client-direct (upload()), not a server put() ---
const fieldSrc = await readFile(resolve(process.cwd(), "app", "admin", "ImageUploadField.tsx"), "utf8");
ok("upload field imports the browser client SDK", fieldSrc.includes('from "@vercel/blob/client"'));
ok("upload field calls the client-direct upload()", /\bupload\(/.test(fieldSrc));
ok("upload field does NOT use a server put()", !/\bput\(/.test(fieldSrc));
ok("upload field points at the token route", fieldSrc.includes("/api/blob/upload"));

const routeSrc = await readFile(resolve(process.cwd(), "app", "api", "blob", "upload", "route.ts"), "utf8");
ok("token route delegates to handleUpload (mints a scoped token, no server put)", routeSrc.includes("handleUpload") && !/\bput\(/.test(routeSrc));

// --- AC1: all six image fields are custom upload fields, none left as text ---
const cfgSrc = await readFile(resolve(process.cwd(), "lib", "puck.config.tsx"), "utf8");
const customCount = (cfgSrc.match(/: imageField,/g) || []).length;
ok("six image fields are wired to the custom upload field", customCount === 6);
ok("imageField is a custom Puck field", /type:\s*"custom"/.test(cfgSrc));
ok("no image prop is left as a bare text field", !/\b(heroImage|image):\s*\{ type: "text" \}/.test(cfgSrc));

let pass = true;
for (const [name, good] of checks) {
  console.log(`${good ? "PASS" : "FAIL"}  ${name}`);
  if (!good) pass = false;
}
console.log(`${checks.filter((c) => c[1]).length}/${checks.length} checks passed`);
console.log(pass ? "M6 UPLOAD CONTRACT PASS" : "M6 UPLOAD CONTRACT FAIL");
process.exit(pass ? 0 : 1);
