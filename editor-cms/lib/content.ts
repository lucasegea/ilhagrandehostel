import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { zPage, type PageData } from "./blocks";

/**
 * Persistence interface (D-104, Atlas Seam 2). Every call site uses loadPage/savePage
 * and nothing else reads the JSON directly. loadPage reads the local working tree.
 * savePage (M4, git-as-DB) writes the local working tree AND commits page.json to
 * GitHub via the REST Contents API — same HTTP calls Octokit would make, native
 * fetch, no extra deps. Fail-clear: a missing token or a non-2xx response throws;
 * there is no silent local-only fallback.
 */

function pagePath(site: string): string {
  return resolve(process.cwd(), "content", site, "page.json");
}

/** Repo-root-relative path of a site's page.json (the app's cwd is editor-cms/). */
function repoPagePath(site: string): string {
  return `editor-cms/content/${site}/page.json`;
}

interface GitHubConfig {
  token: string;
  repo: string;
  branch: string;
}

/** Reads GitHub config from env. Throws clearly if the token is absent (fail-clear). */
function githubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "savePage: GITHUB_TOKEN is not set — cannot publish to GitHub (no silent local-only fallback)."
    );
  }
  return {
    token,
    repo: process.env.GITHUB_REPO || "lucasegea/ilhagrandehostel",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/**
 * Returns the current blob sha of a repo file, or undefined if it does not exist yet
 * (404 → create). Any other non-2xx is a hard failure.
 */
async function getFileSha(
  cfg: GitHubConfig,
  path: string
): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, { headers: githubHeaders(cfg.token) });
  if (res.status === 404) return undefined;
  if (!res.ok) {
    throw new Error(
      `savePage: GitHub GET ${path} failed (${res.status}): ${await res.text()}`
    );
  }
  const body = (await res.json()) as { sha?: string };
  return body.sha;
}

/** Commits page.json to GitHub. Creates the file if absent, updates it (with sha) otherwise. */
async function commitPage(
  cfg: GitHubConfig,
  site: string,
  serialized: string
): Promise<void> {
  const path = repoPagePath(site);
  const sha = await getFileSha(cfg, path);
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${path}`;
  const payload: Record<string, unknown> = {
    message: `chore(cms): publish ${site} page`,
    content: Buffer.from(serialized, "utf8").toString("base64"),
    branch: cfg.branch,
  };
  if (sha) payload.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...githubHeaders(cfg.token), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(
      `savePage: GitHub PUT ${path} failed (${res.status}): ${await res.text()}`
    );
  }
}

/** Reads and validates a site's page.json. Throws if missing or contract-invalid. */
export async function loadPage(site: string): Promise<PageData> {
  const raw = await readFile(pagePath(site), "utf8");
  return zPage.parse(JSON.parse(raw));
}

/**
 * Best-effort local mirror of page.json so `next dev` reflects an edit immediately.
 * This is a DEV CONVENIENCE, not the source of truth. On Vercel (and any read-only
 * serverless filesystem) it is a no-op: the lambda FS is read-only and ephemeral, and
 * the live site refreshes through the GitHub commit + git-connected redeploy below,
 * never through this write. We skip it proactively when running on Vercel
 * (process.env.VERCEL) and, as a safety net for other read-only hosts, swallow an
 * EROFS from the write itself. Any other fs error is a real anomaly and propagates.
 * This is NOT a "silent local-only fallback" (which the commit forbids): the
 * authoritative persistence is the GitHub commit, and it stays fail-clear.
 */
async function mirrorLocalWorkingTree(site: string, serialized: string): Promise<void> {
  if (process.env.VERCEL) return;
  const path = pagePath(site);
  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, serialized, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "EROFS") return;
    throw e;
  }
}

/**
 * Persists a page: validate against the contract, mirror to the local working tree (a
 * dev convenience, skipped on read-only serverless), then commit to GitHub. The commit
 * is the authoritative git-as-DB persistence; if it fails the error propagates to the
 * caller — no silent local-only fallback.
 */
export async function savePage(site: string, data: PageData): Promise<void> {
  const validated = zPage.parse(data);
  const serialized = JSON.stringify(validated, null, 2) + "\n";

  await mirrorLocalWorkingTree(site, serialized);

  await commitPage(githubConfig(), site, serialized);
}
