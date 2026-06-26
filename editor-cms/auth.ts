import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowed } from "./lib/auth-allowlist";

/**
 * Auth.js v5 setup (M5, D-105). Google OAuth + email allowlist, JWT session, no DB.
 *
 * Defense in depth (mirrors the sites.ts fail-clear posture): the allowlist is the
 * gate, enforced in TWO independent places.
 *   1. The signIn callback below rejects any non-allowlisted email, so a non-editor
 *      never receives a session at all (first line of defense).
 *   2. The publish path re-checks the session email against the allowlist server-side
 *      (see app/admin/actions.ts and app/api/publish/route.ts) — it never trusts that
 *      a session merely exists.
 *
 * Fail-clear: if EDITOR_EMAILS is empty/unset/malformed, isAllowed denies everyone.
 * We never fall open. A valid editor blocked is recoverable; a stranger in the editor
 * is not.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    /**
     * Gate the session at the door: only allowlisted emails get one. Returning false
     * aborts the OAuth sign-in (Auth.js redirects to the error page), so a non-editor
     * who completes Google OAuth still never lands in /admin.
     */
    signIn({ user }) {
      return isAllowed(user?.email, process.env.EDITOR_EMAILS ?? "");
    },
  },
});
