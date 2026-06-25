import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { zPage, type PageData } from "./blocks";

/**
 * Persistence interface (D-104, Atlas Seam 2). Every call site uses loadPage/savePage
 * and nothing else reads the JSON directly. v1 body is the local filesystem; M4 swaps
 * savePage's body to an Octokit git commit without touching any caller.
 */

function pagePath(site: string): string {
  return resolve(process.cwd(), "content", site, "page.json");
}

/** Reads and validates a site's page.json. Throws if missing or contract-invalid. */
export async function loadPage(site: string): Promise<PageData> {
  const raw = await readFile(pagePath(site), "utf8");
  return zPage.parse(JSON.parse(raw));
}

/** Persists a page. v1: write to disk. M4: commit via GitHub API. */
export async function savePage(site: string, data: PageData): Promise<void> {
  const path = pagePath(site);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}
