"use client";

import { useState } from "react";
import type { BlockProps } from "../../lib/blocks";
import s from "./conceito1.module.css";

/**
 * Client island: the testimonials carousel (mockup #vozes). Real interactivity —
 * prev/next + dots slide the track, matching proposals/conceito-1 JS. Initial
 * render (index 0) is what the visual-fidelity baseline captures.
 */
export default function VozesCarousel(p: BlockProps<"vozes">) {
  const items = p.items ?? [];
  const [index, setIndex] = useState(0);
  const slides = items.length || 1;
  const go = (n: number) => setIndex(((n % slides) + slides) % slides);

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

        <div className={s.carousel}>
          <div className={s.carouselViewport}>
            <div
              className={s.carouselTrack}
              style={{ transform: `translateX(${-index * 100}%)` }}
            >
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
                      <span className={s.where}>
                        <span className={s.badgeSrc}>{it.source}</span>
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          {slides > 1 && (
            <div className={s.carouselControls}>
              <button
                className={s.carBtn}
                onClick={() => go(index - 1)}
                aria-label="Depoimento anterior"
              >
                ‹
              </button>
              <div className={s.dots} role="tablist" aria-label="Selecionar depoimento">
                {items.map((_, i) => (
                  <button
                    key={i}
                    className={`${s.dot} ${i === index ? s.dotActive : ""}`}
                    aria-label={`Ir para o depoimento ${i + 1}`}
                    aria-selected={i === index}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
              <button
                className={s.carBtn}
                onClick={() => go(index + 1)}
                aria-label="Próximo depoimento"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
