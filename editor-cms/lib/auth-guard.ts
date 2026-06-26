import { auth } from "../auth";
import { isAllowed } from "./auth-allowlist";

/**
 * Server-side publish guard (M5, AC5.2). The second of the two allowlist enforcement
 * points (the first is the signIn callback in auth.ts). The publish path NEVER trusts
 * that a session merely exists — it re-reads the session here and re-checks the email
 * against EDITOR_EMAILS server-side. This closes the gap where a stale or otherwise
 * present session does not correspond to a current editor.
 *
 * Fail-clear: no session, no email, or a non-allowlisted email -> false. The callers
 * (the publish server action and /api/publish) turn a false into a 403-shaped refusal.
 */
export async function isAuthorizedEditor(): Promise<boolean> {
  const session = await auth();
  return isAllowed(session?.user?.email, process.env.EDITOR_EMAILS ?? "");
}
