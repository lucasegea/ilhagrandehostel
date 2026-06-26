import type { CSSProperties } from "react";
import type { BlockProps } from "../../lib/blocks";
import s from "./vozes.module.css";

/**
 * Shared testimonials grid (DRY, Atlas D-CALY-6). One presentational component for
 * the `.a-voz` card pattern from proposals/conceito-1/agencia.html, reused by both
 * the hostel (conceito1) and Calytour. Brand-variable colors are CSS variables
 * (`--voz-*`); each theme passes its own values via `vars`, the structure is shared.
 * Server component (no interactivity), so it never passes function props across the
 * RSC boundary. Was themes/conceito1/VozesGrid.tsx (pedido A) before the extraction.
 */

// Stored source values carry an emoji prefix ("🔵 Google", "🟦 Booking.com").
// Strip any leading non-letter chars so the .where line reads "★★★★★ · Google".
function sourceName(source: string) {
  return source.replace(/^[^\p{L}]+/u, "").trim();
}

export default function VozesGrid(
  p: BlockProps<"vozes"> & { vars?: CSSProperties }
) {
  const items = p.items ?? [];

  return (
    <section className={s.vozes} id="vozes" style={p.vars}>
      <div className={s.wrap}>
        <div className={s.vozesHead}>
          <div>
            {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
            <h2>{p.headline}</h2>
          </div>
          {p.subtitle && (
            <p className={s.lead} style={{ margin: 0 }}>
              {p.subtitle}
            </p>
          )}
        </div>

        <div className={s.vozGrid}>
          {items.map((it, i) => (
            <figure className={s.voz} key={i}>
              <div className={s.stars} aria-hidden="true">
                {it.stars}
              </div>
              <blockquote>{it.quote}</blockquote>
              <figcaption>
                <span className={s.who}>{it.name}</span>
                {it.city ? ` — ${it.city}` : ""}
                {it.source && (
                  <div className={s.where}>
                    <span aria-hidden="true">{it.stars}</span> · {sourceName(it.source)}
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
