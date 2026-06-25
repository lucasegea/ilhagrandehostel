import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { zPage } from "../lib/blocks";

/**
 * Validates a site's page.json against the block contract (lib/blocks.ts).
 * Exit 0 = valid. Non-zero = unreadable, bad JSON, or a contract violation.
 * Usage: npm run validate:content [site]   (site defaults to "ilhagrande")
 */

const site = process.argv[2] ?? "ilhagrande";
const path = resolve(process.cwd(), "content", site, "page.json");

let raw: string;
try {
  raw = readFileSync(path, "utf8");
} catch (e) {
  console.error(`[validate:content] cannot read ${path}: ${(e as Error).message}`);
  process.exit(1);
}

let json: unknown;
try {
  json = JSON.parse(raw);
} catch (e) {
  console.error(`[validate:content] invalid JSON in ${path}: ${(e as Error).message}`);
  process.exit(1);
}

const result = zPage.safeParse(json);
if (!result.success) {
  console.error(`[validate:content] FAIL ${site}/page.json`);
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(
  `[validate:content] OK ${site}/page.json — ${result.data.content.length} blocks valid`
);
process.exit(0);
