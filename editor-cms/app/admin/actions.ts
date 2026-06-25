"use server";

import { savePage } from "../../lib/content";
import { zPage } from "../../lib/blocks";

/**
 * Local publish (M3): validate the editor's data against the contract and persist
 * it via savePage. v1 body writes the working-tree page.json; M4 swaps savePage to
 * the git-as-DB commit. This is NOT the git publish yet, just a real local save so
 * an edit in /admin shows on / (which is force-dynamic).
 */
export async function publishLocal(data: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = zPage.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.path.join(".")).join(", ") };
  }
  await savePage("ilhagrande", parsed.data);
  return { ok: true };
}
