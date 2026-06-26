import { NextResponse } from "next/server";
import { auth } from "./auth";

/**
 * Route protection (M5, AC5.1). /admin requires a session. A request without one is
 * redirected to the Auth.js sign-in page (which kicks off Google OAuth), so the editor
 * is never rendered to an unauthenticated visitor. ?site= is preserved through the
 * callbackUrl so the operator lands back on the same site after login.
 *
 * The session itself can only exist for an allowlisted email (auth.ts signIn callback),
 * so this redirect plus that gate already keeps non-editors out of /admin; the publish
 * path adds a second server-side allowlist check (defense in depth).
 */
export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  if (!req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

export const config = {
  // Run on /admin (and nested paths). Auth.js' own /api/auth/* is intentionally excluded.
  matcher: ["/admin/:path*", "/admin"],
};
