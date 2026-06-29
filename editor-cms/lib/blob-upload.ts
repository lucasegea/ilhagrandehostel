/**
 * Blob upload contract (M6, D-106). The IO-free pieces of the client-direct upload
 * token route, factored out so they are unit-testable in isolation (same posture as
 * lib/auth-allowlist.ts and lib/sites.ts) and shared by app/api/blob/upload/route.ts.
 * Keeping these here means the route stays a thin handler and the contract has an
 * executable home in tests/m6-upload.mjs.
 */

/**
 * Content types the minted upload token permits. Images only: the token forbids the
 * browser from PUTting anything else to the store, so a non-image pick is rejected at
 * the edge by Vercel Blob, not after the bytes have already transited.
 */
export const IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
] as const;

/**
 * Fail-clear store-token guard. BLOB_READ_WRITE_TOKEN is read lazily at request time
 * only (never at import/build, mirroring GITHUB_TOKEN in lib/content.ts), so
 * `npm run build` stays green without it. A missing token throws a readable message
 * rather than letting a token be minted blindly or the SDK fail opaquely — no silent
 * fallback. Returns the token so the caller can use it inline.
 */
export function requireBlobToken(token: string | undefined): string {
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN não configurado");
  }
  return token;
}
