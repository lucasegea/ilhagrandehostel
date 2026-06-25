"use server";

import { savePage } from "../../lib/content";
import { zPage } from "../../lib/blocks";

/**
 * Publish (M4): validate the editor's data against the contract and persist it via
 * savePage, which writes the working-tree page.json AND commits it to GitHub
 * (git-as-DB). Fail-clear: if savePage throws (missing token / GitHub error) the
 * message is surfaced to the editor rather than silently swallowed.
 */
export async function publish(data: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = zPage.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.path.join(".")).join(", ") };
  }
  try {
    await savePage("ilhagrande", parsed.data);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  return { ok: true };
}
