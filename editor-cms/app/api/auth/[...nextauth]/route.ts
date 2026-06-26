/**
 * Auth.js v5 route handlers (M5). Re-exports the GET/POST handlers built in auth.ts so
 * the framework owns /api/auth/* (sign-in, callback, session, csrf, signout).
 */
import { handlers } from "../../../../auth";

export const { GET, POST } = handlers;
