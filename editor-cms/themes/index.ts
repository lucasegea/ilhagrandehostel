import baseTheme from "./base";
import stubTheme from "./stub";
import conceito1Theme from "./conceito1";

/**
 * Theme registry (Atlas Seam 4). The active theme is resolved from the env once
 * per process. NEXT_PUBLIC_THEME is read so both the server render (/) and the
 * client editor (/admin) resolve the same theme (WYSIWYG parity). THEME is also
 * accepted as a server-only fallback. Unknown value falls back to "base".
 */

const registry = {
  base: baseTheme,
  stub: stubTheme,
  conceito1: conceito1Theme,
} as const;

export type ThemeName = keyof typeof registry;

const requested = process.env.NEXT_PUBLIC_THEME || process.env.THEME || "base";

export const THEME_NAME: ThemeName = requested in registry ? (requested as ThemeName) : "base";

export const activeTheme = registry[THEME_NAME];
export const activeComponents = activeTheme.components;
