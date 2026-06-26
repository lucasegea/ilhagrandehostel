import type { BlockProps } from "../../lib/blocks";
import s from "./conceito1.module.css";

/**
 * Testimonials as a static 3-up grid (mockup proposals/conceito-1/agencia.html
 * `.a-vozes` / `.a-voz`). DELIBERATE deviation from index.html's #vozes carousel:
 * the user chose the agencia grid look. Server component — no interactivity, so it
 * also avoids passing function props (puck/editMode) across the RSC boundary.
 */

// Stored source values carry an emoji prefix ("🔵 Google", "🟦 Booking.com").
// Strip any leading non-letter chars so the .where line reads "★★★★★ · Google".
function sourceName(source: string) {
  return source.replace(/^[^\p{L}]+/u, "").trim();
}

export default function VozesGrid(p: BlockProps<"vozes">) {
  const items = p.items ?? [];

  return (
    <section className={`${s.section} ${s.vozes}`} id="vozes">
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
