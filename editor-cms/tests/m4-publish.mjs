import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { savePage } = await import("../lib/content");

/**
 * M4 contract test (D-104): savePage commits page.json to GitHub via the Contents API.
 * Mocks global.fetch and asserts the GET-then-PUT shape, target URL, branch, forwarded
 * sha, and that the PUT body base64 decodes to the page data. Also asserts fail-clear:
 * with GITHUB_TOKEN unset, savePage throws and never touches the network.
 * Run: npx tsx tests/m4-publish.mjs   (tsx resolves the extensionless lib/content import to .ts)
 *
 * savePage also writes the local working tree; this test restores the original
 * content/ilhagrande/page.json bytes at the end so it leaves no diff.
 */

const PAGE = resolve(process.cwd(), "content", "ilhagrande", "page.json");
const original = await readFile(PAGE, "utf8");
const data = JSON.parse(original); // contract-valid fixture from the real page.json
const SHA = "deadbeefcafe1234";

const realFetch = global.fetch;
const checks = [];
const ok = (name, cond) => { checks.push([name, !!cond]); };

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual(a[k], b[k]));
}

try {
  // --- success path: GET (returns sha) then PUT ---
  process.env.GITHUB_TOKEN = "test-token";
  delete process.env.GITHUB_REPO;   // exercise the lucasegea/ilhagrandehostel default
  delete process.env.GITHUB_BRANCH; // exercise the main default

  const calls = [];
  global.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || "GET", body: init.body });
    if ((init.method || "GET") === "GET") {
      return { ok: true, status: 200, json: async () => ({ sha: SHA }), text: async () => "" };
    }
    return { ok: true, status: 201, json: async () => ({}), text: async () => "" };
  };

  await savePage("ilhagrande", data);

  const EXPECTED = "/repos/lucasegea/ilhagrandehostel/contents/editor-cms/content/ilhagrande/page.json";
  ok("two fetch calls (GET then PUT)", calls.length === 2 && calls[0].method === "GET" && calls[1].method === "PUT");
  ok("GET targets the repo contents URL", calls[0]?.url.includes(EXPECTED));
  ok("GET reads the main branch (ref=main)", calls[0]?.url.includes("ref=main"));
  ok("PUT targets the same repo contents URL", calls[1]?.url.includes(EXPECTED));

  const putBody = JSON.parse(calls[1]?.body ?? "{}");
  ok("PUT body branch === main", putBody.branch === "main");
  ok("PUT forwards the sha from GET", putBody.sha === SHA);

  const decoded = Buffer.from(putBody.content ?? "", "base64").toString("utf8");
  ok("PUT content is trailing-newline JSON", decoded.endsWith("\n"));
  ok("PUT content decodes to the page data", deepEqual(JSON.parse(decoded), data));

  // --- fail-clear: no token -> throw, no network ---
  delete process.env.GITHUB_TOKEN;
  const before = calls.length;
  let threw = false;
  try {
    await savePage("ilhagrande", data);
  } catch (e) {
    threw = true;
    ok("fail-clear error names GITHUB_TOKEN", /GITHUB_TOKEN/.test((e).message));
  }
  ok("savePage throws when GITHUB_TOKEN is unset", threw);
  ok("no GitHub call made without a token", calls.length === before);
} finally {
  global.fetch = realFetch;
  await writeFile(PAGE, original, "utf8"); // leave the working tree untouched
}

let pass = true;
for (const [name, good] of checks) {
  console.log(`${good ? "PASS" : "FAIL"}  ${name}`);
  if (!good) pass = false;
}
console.log(pass ? "M4 PUBLISH CONTRACT PASS" : "M4 PUBLISH CONTRACT FAIL");
process.exit(pass ? 0 : 1);
