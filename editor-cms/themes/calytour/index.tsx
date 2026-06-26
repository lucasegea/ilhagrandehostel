import type { CSSProperties } from "react";
import type { BlockProps, BlockType } from "../../lib/blocks";
import s from "./calytour.module.css";
import VozesGrid from "../_shared/VozesGrid";

/**
 * Theme calytour (Atlas D-CALY-4): the Calytour agency page, own brand identity
 * (gold -> blue, logo-derived), shape from proposals/conceito-1/agencia.html. The
 * hostel chrome is NOT reused — Calytour has its own minimal header (brand + back to
 * hostel) and simple footer. The agency's 4 service cards (icon/title/description)
 * map to the `comodidades` block; the closing WhatsApp CTA maps to `calytour-destacada`
 * (a divergence from a literal reading of the block names: the block DATA shapes that
 * carry descriptions / a body+cta are the ones used). The reviews grid reuses the
 * shared VozesGrid (DRY) with Calytour's colors. Server-safe components throughout.
 */

export const tokens = {
  gold: "#DF9C03",
  goldHi: "#EBBD06",
  ocean: "#1765B0",
  oceanDk: "#0C56B7",
  green: "#78CA8A",
  tealDk: "#043447",
};

const BACK_LABEL = "← Voltar ao hostel";

// Calytour brand colors for the shared testimonials grid.
const CALY_VOZ_VARS = {
  "--voz-maxw": "1100px",
  "--voz-section-bg": "#f4f8fb",
  "--voz-eyebrow": "#DF9C03",
  "--voz-heading": "#043447",
  "--voz-lead": "#5b6b72",
  "--voz-card-bg": "#ffffff",
  "--voz-card-radius": "18px",
  "--voz-card-shadow": "0 12px 30px -16px rgba(4,52,71,0.28)",
  "--voz-stars": "#DF9C03",
  "--voz-quote": "#26323a",
  "--voz-name": "#043447",
  "--voz-meta": "#7d8b91",
} as CSSProperties;

function Header() {
  return (
    <header className={s.header}>
      <div className={`${s.wrap} ${s.headerInner}`}>
        <a className={s.brand} href="#topo" aria-label="Calytour — início">
          <img src="/logo-calytour.jpg" alt="Logo da Calytour" />
          <span>
            <b>Calytour</b>
            <span>Travel Company</span>
          </span>
        </a>
        <a className={s.back} href="/">
          {BACK_LABEL}
        </a>
      </div>
    </header>
  );
}

function Hero(p: BlockProps<"hero">) {
  const cardStyle: CSSProperties | undefined = p.heroImage
    ? {
        backgroundImage: `linear-gradient(150deg, rgba(223,156,3,0.88), rgba(23,101,176,0.9)), url(${p.heroImage})`,
      }
    : undefined;
  return (
    <>
      <Header />
      <section className={s.hero} id="topo">
        <div className={s.wrap}>
          <div className={s.heroCard} style={cardStyle}>
            {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
            <h1>{p.headline}</h1>
            {p.subtitle && <p>{p.subtitle}</p>}
            {p.ctas.length > 0 && (
              <div className={s.heroActions}>
                {p.ctas.map((c, i) => (
                  <a key={i} className={`${s.btn} ${s.btnPrimary}`} href={c.url}>
                    {c.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// Agency services: the 4 icon/title/description cards (comodidades block).
function Servicos(p: BlockProps<"comodidades">) {
  return (
    <section className={s.section} id="servicos">
      <div className={s.wrap}>
        {p.headline && <h2>{p.headline}</h2>}
        <div className={s.services} style={{ marginTop: 22 }}>
          {p.items.map((c, i) => (
            <article className={s.service} key={i}>
              <span className={s.ic} aria-hidden="true">
                {c.icon}
              </span>
              <h3>{c.label}</h3>
              {c.description && <p>{c.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Vozes(p: BlockProps<"vozes">) {
  return <VozesGrid {...p} vars={CALY_VOZ_VARS} />;
}

// Closing WhatsApp CTA (calytour-destacada block: headline + body + optional chips + cta).
function CtaFinal(p: BlockProps<"calytour-destacada">) {
  return (
    <section className={s.cta}>
      <div className={s.wrap}>
        <div className={s.ctaCard}>
          <h2>{p.headline}</h2>
          {p.body && <p>{p.body}</p>}
          {p.services.length > 0 && (
            <div className={s.ctaChips}>
              {p.services.map((sv, i) => (
                <span className={s.ctaChip} key={i}>
                  {sv.icon} {sv.label}
                </span>
              ))}
            </div>
          )}
          <a
            className={`${s.btn} ${s.btnWa}`}
            href={p.cta.url}
            target="_blank"
            rel="noopener"
          >
            {p.cta.label}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer(p: BlockProps<"footer">) {
  return (
    <footer className={s.footer}>
      <div className={`${s.wrap} ${s.footerInner}`}>
        <span className={s.footerBrand}>
          <img src="/logo-calytour.jpg" alt="Logo da Calytour" />
          <span>{p.copyright || `© Calytour`}</span>
        </span>
        <a href="/">{BACK_LABEL}</a>
      </div>
    </footer>
  );
}

export const components: Partial<Record<BlockType, (props: any) => JSX.Element>> = {
  hero: Hero,
  comodidades: Servicos,
  vozes: Vozes,
  "calytour-destacada": CtaFinal,
  footer: Footer,
};

const calytourTheme = { components, tokens };
export default calytourTheme;
