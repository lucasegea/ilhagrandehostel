"use server";

import { savePage } from "../../lib/content";
import { zPage } from "../../lib/blocks";
import { isSite } from "../../lib/sites";

/**
 * Publish (M4, multi-site D-CALY-5): validate the editor's data against the contract
 * and persist it via savePage, which writes the working-tree page.json AND commits it
 * to GitHub (git-as-DB). The site is re-validated against the allowlist here — the
 * client's site is never trusted blindly, so a bad site cannot write outside the
 * allowlist. Fail-clear: if savePage throws (missing token / GitHub error) the message
 * is surfaced to the editor rather than silently swallowed.
 */
export async function publish(
  site: string,
  data: unknown
): Promise<{ ok: boolean; error?: string }> {
  if (!isSite(site)) {
    return { ok: false, error: `site inválido: ${String(site)}` };
  }
  const parsed = zPage.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.path.join(".")).join(", ") };
  }
  try {
    await savePage(site, parsed.data);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  return { ok: true };
}
