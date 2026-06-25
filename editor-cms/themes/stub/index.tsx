import baseTheme, { tokens } from "../base";
import type { BlockProps, BlockType } from "../../lib/blocks";

/**
 * Stub theme (Atlas Seam 4): spreads the base theme and overrides ONE component
 * (hero) so a THEME swap is visibly provable (AC2.2) without reimplementing 12.
 * The other 11 blocks fall through to base.
 */

function StubHero(p: BlockProps<"hero">) {
  return (
    <section
      style={{
        background: "#10212b",
        color: "#7CFFB2",
        padding: "64px 24px",
        fontFamily: "ui-monospace, Menlo, monospace",
        borderBottom: "3px dashed #7CFFB2",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <p style={{ opacity: 0.7, margin: 0 }}>[ STUB THEME · hero ]</p>
        <h1 style={{ color: "#7CFFB2", fontSize: 40, margin: "8px 0" }}>{p.headline}</h1>
        <p style={{ opacity: 0.85 }}>{p.subtitle}</p>
      </div>
    </section>
  );
}

export const components: Record<BlockType, (props: any) => JSX.Element> = {
  ...baseTheme.components,
  hero: StubHero,
};

const stubTheme = { components, tokens };
export default stubTheme;
