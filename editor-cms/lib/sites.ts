/**
 * Site allowlist (Atlas D-CALY-5). Single source of truth for which sites the CMS
 * serves and edits. The admin route and the publish action both validate against
 * THIS list — a present-but-unknown site is rejected fail-clear, never silently
 * routed into another site's content.
 */

export const SITES = ["ilhagrande", "calytour"] as const;
export type Site = (typeof SITES)[number];

export const DEFAULT_SITE: Site = "ilhagrande";

export function isSite(value: unknown): value is Site {
  return typeof value === "string" && (SITES as readonly string[]).includes(value);
}

/**
 * Resolve a site from an untrusted value.
 * - absent (undefined/null/"") -> DEFAULT_SITE (the admin lands on the hostel)
 * - a known site -> that site
 * - a present-but-unknown value -> null (caller renders a fail-clear error; we do
 *   NOT fall back to the default, which would silently serve the wrong site)
 */
export function resolveSite(value: unknown): Site | null {
  if (value === undefined || value === null || value === "") return DEFAULT_SITE;
  return isSite(value) ? value : null;
}
