"use server";

import { savePage } from "../../lib/content";
import { zPage } from "../../lib/blocks";
import { isSite } from "../../lib/sites";
import { isAuthorizedEditor } from "../../lib/auth-guard";

/**
 * Publish (M4, multi-site D-CALY-5; M5 auth): validate the editor's data against the
 * contract and persist it via savePage, which writes the working-tree page.json AND
 * commits it to GitHub (git-as-DB). This is the real publish entry point the Editor
 * calls, so it is the second allowlist enforcement point (M5, AC5.2): we re-check the
 * session email against EDITOR_EMAILS here and refuse if it is absent/not-allowed,
 * never trusting that a session merely exists. The site is also re-validated against
 * the allowlist — the client's site is never trusted blindly. Fail-clear: if savePage
 * throws (missing token / GitHub error) the message is surfaced rather than swallowed.
 */
export async function publish(
  site: string,
  data: unknown
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAuthorizedEditor())) {
    return { ok: false, error: "403: não autorizado" };
  }
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
