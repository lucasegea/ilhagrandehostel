import { NextResponse } from "next/server";
import { savePage } from "../../../lib/content";
import { zPage } from "../../../lib/blocks";
import { isSite } from "../../../lib/sites";
import { isAuthorizedEditor } from "../../../lib/auth-guard";

/**
 * Publish endpoint (M5, AC5.2). The same git-as-DB publish as the server action, exposed
 * as an HTTP POST so the allowlist refusal is observable as a literal 403. Mirrors the
 * server action's guards in the same order:
 *   - non-allowlisted (or sessionless) caller         -> 403
 *   - unknown site / contract-invalid body            -> 400
 *   - savePage failure (missing token / GitHub error) -> 500, message surfaced
 * Fail-clear throughout: any ambiguity is a refusal, never a silent success.
 *
 * Body: { "site": "ilhagrande" | "calytour", "data": <Puck page data> }.
 */
export async function POST(req: Request): Promise<Response> {
  if (!(await isAuthorizedEditor())) {
    return NextResponse.json({ ok: false, error: "não autorizado" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "corpo inválido" }, { status: 400 });
  }

  const { site, data } = (body ?? {}) as { site?: unknown; data?: unknown };
  if (!isSite(site)) {
    return NextResponse.json(
      { ok: false, error: `site inválido: ${String(site)}` },
      { status: 400 }
    );
  }

  const parsed = zPage.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues.map((i) => i.path.join(".")).join(", ") },
      { status: 400 }
    );
  }

  try {
    await savePage(site, parsed.data);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
