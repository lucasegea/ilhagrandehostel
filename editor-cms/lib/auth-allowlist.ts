/**
 * Editor allowlist (M5, D-105). Single source of truth for the auth decision: which
 * emails may enter /admin and publish. The signIn callback and the publish path both
 * validate against THIS helper. It is PURE and IO-free (no env reads, no session) so
 * the decision is unit-testable in isolation; callers pass process.env.EDITOR_EMAILS.
 *
 * Fail-clear, never fall open (mirrors lib/sites.ts): any ambiguity is a deny. An
 * empty or malformed allowlist denies everyone — a non-allowlisted user getting in is
 * strictly worse than a valid user being blocked.
 */

/** Parse a comma-separated allowlist into normalized (trimmed, lowercased) emails. */
export function parseAllowlist(allowlist: string | null | undefined): string[] {
  if (typeof allowlist !== "string") return [];
  return allowlist
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

/**
 * Is `email` allowed by `allowlist` (comma-separated)?
 * - email absent (null/undefined/"") or not a string -> deny
 * - allowlist empty/whitespace/malformed (no usable entries) -> deny everyone
 * - otherwise: case-insensitive, whitespace-trimmed exact match
 */
export function isAllowed(
  email: string | null | undefined,
  allowlist: string
): boolean {
  if (typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0) return false;

  const allowed = parseAllowlist(allowlist);
  if (allowed.length === 0) return false; // fail-clear: empty allowlist locks everyone out

  return allowed.includes(normalized);
}
