import type { BlockType } from "../lib/blocks";
import baseTheme from "./base";
import stubTheme from "./stub";
import conceito1Theme from "./conceito1";
import calytourTheme from "./calytour";

/**
 * Theme registry (Atlas Seam 4, refactor D-CALY-1). The CMS is multi-site: each
 * site resolves to its own theme via `themeForSite`, NOT a single env-once global.
 * The public render, the per-site public routes, and the editor all resolve the
 * theme from the SITE being rendered/edited, which preserves WYSIWYG parity per
 * site without one process being locked to one theme. A theme need not implement
 * every block: a missing component renders nothing + a warn (see lib/puck.config).
 */

export type ThemeComponents = Partial<Record<BlockType, (props: any) => JSX.Element>>;
export interface Theme {
  components: ThemeComponents;
  tokens: Record<string, string>;
}

const registry: Record<string, Theme> = {
  base: baseTheme,
  stub: stubTheme,
  conceito1: conceito1Theme,
  calytour: calytourTheme,
};

/** Which theme each site renders with. Unknown site -> base (never throws). */
const themeForSiteMap: Record<string, keyof typeof registry> = {
  ilhagrande: "conceito1",
  calytour: "calytour",
};

export function themeForSite(site: string): Theme {
  const name = themeForSiteMap[site] ?? "base";
  return registry[name];
}
