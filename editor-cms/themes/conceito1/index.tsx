import { Fragment } from "react";
import type { BlockProps, BlockType } from "../../lib/blocks";
import s from "./conceito1.module.css";
import VozesCarousel from "./VozesCarousel";
import ReservarForm from "./ReservarForm";

/**
 * Theme conceito1 (7.A): faithful render of proposals/conceito-1/index.html +
 * styles.css. Server-safe components share the CSS module; two client islands
 * (VozesCarousel, ReservarForm) carry the genuine interactivity. Light-mode.
 */

export const tokens = {
  terracota: "#A0461E",
  terracotaEsc: "#8A3A18",
  creme: "#FBFBDF",
  areiaClara: "#ECEBD9",
  areia: "#E6DEC6",
  tinta: "#3B2418",
  texto: "#5C4232",
  verde: "#2F5135",
  teal: "#2C6E72",
  ambar: "#C9893F",
  branco: "#FFFDF2",
};

const CALY_PHOTO =
  "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1200&q=70";

// First line bold, remaining lines plain (mockup loc-card items carry a title + detail).
function renderLines(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) =>
    i === 0 ? (
      <b key={i}>{line}</b>
    ) : (
      <Fragment key={i}>
        <br />
        {line}
      </Fragment>
    )
  );
}

// "R$ 90 /noite" -> "R$ 90 " + <small>/noite</small>
function renderPrice(price: string) {
  const idx = price.indexOf("/");
  if (idx === -1) return price;
  return (
    <>
      {price.slice(0, idx)}
      <small>/{price.slice(idx + 1).trim()}</small>
    </>
  );
}

function SiteHeader() {
  const links: Array<[string, string]> = [
    ["#a-casa", "A Casa"],
    ["#vozes", "Vozes"],
    ["#quartos", "Quartos"],
    ["#experiencias", "Experiências"],
    ["#calytour", "Calytour"],
    ["#localizacao", "Onde estamos"],
  ];
  const mobileLinks: Array<[string, string]> = [
    ...links.slice(0, 3),
    ["#comodidades", "Comodidades"],
    ...links.slice(3),
    ["#galeria", "Galeria"],
    ["#reservar", "Reservar"],
  ];
  return (
    <header className={s.siteHeader}>
      {/* CSS-only mobile menu toggle (server-safe) */}
      <input type="checkbox" id="navToggle" className={s.navToggle} aria-hidden="true" tabIndex={-1} />
      <div className={`${s.wrap} ${s.nav}`}>
        <a className={s.brand} href="#topo" aria-label="Ilha Grande Hostel — início">
          <img src="/logo-hostel.jpg" alt="Logo do Ilha Grande Hostel" />
          <span>
            <b>Ilha Grande Hostel</b>
            <span>A Casa na Ilha</span>
          </span>
        </a>
        <nav aria-label="Navegação principal">
          <ul className={s.navLinks}>
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
            <li className={s.navCta}>
              <a className={`${s.btn} ${s.btnPrimary}`} href="#reservar">
                Reservar
              </a>
            </li>
          </ul>
        </nav>
        <label className={s.hamburger} htmlFor="navToggle" aria-label="Abrir menu">
          <span />
          <span />
          <span />
        </label>
      </div>
      <div className={s.mobileMenu} id="mobileMenu">
        <ul>
          {mobileLinks.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

function Hero(p: BlockProps<"hero">) {
  const cardStyle = p.heroImage
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(59,36,24,.10), rgba(59,36,24,.62)), url(${p.heroImage})`,
      }
    : undefined;
  return (
    <>
      <SiteHeader />
      <section className={s.hero} id="topo">
        <div className={s.wrap}>
          <div className={s.heroCard} style={cardStyle}>
            {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
            <h1>{p.headline}</h1>
            {p.subtitle && <p>{p.subtitle}</p>}
            <div className={s.heroActions}>
              {p.ctas.map((c, i) => (
                <a
                  key={i}
                  className={`${s.btn} ${i === 0 ? s.btnPrimary : s.btnGhost}`}
                  href={c.url}
                >
                  {c.label}
                </a>
              ))}
            </div>
            {p.badges.length > 0 && (
              <div className={s.heroBadges}>
                {p.badges.map((b, i) => (
                  <span key={i} className={s.heroBadge}>
                    {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Sobre(p: BlockProps<"sobre">) {
  return (
    <section className={s.section} id="a-casa">
      <div className={s.wrap}>
        <div className={s.casaGrid}>
          <div>
            {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
            <h2>{p.headline}</h2>
            {p.body && <p className={s.lead}>{p.body}</p>}
            {p.values.length > 0 && (
              <div className={s.casaValues}>
                {p.values.map((v, i) => (
                  <div className={s.value} key={i}>
                    <span className={s.ic} aria-hidden="true">
                      {v.icon}
                    </span>
                    <div>
                      <h4>{v.title}</h4>
                      {v.description && <p>{v.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={s.casaPhoto}>
            {p.image ? (
              <img src={p.image} alt={p.headline} />
            ) : (
              <div style={{ height: 300, background: "linear-gradient(135deg,#ECEBD9,#C9893F)" }} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Quartos(p: BlockProps<"quartos">) {
  return (
    <section className={s.section} id="quartos">
      <div className={s.wrap}>
        {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
        <h2>{p.headline}</h2>
        {p.subtitle && <p className={s.lead}>{p.subtitle}</p>}
        <div className={s.rooms}>
          {p.items.map((q, i) => (
            <article className={s.room} key={i}>
              {q.image ? (
                <img src={q.image} alt={q.name} />
              ) : (
                <div className={s.roomImgPlaceholder} />
              )}
              <div className={s.roomBody}>
                <h3>{q.name}</h3>
                {q.description && <p>{q.description}</p>}
                {q.meta.length > 0 && (
                  <div className={s.roomTags}>
                    {q.meta.map((m, j) => (
                      <span className={s.roomTag} key={j}>
                        {m.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className={s.roomFoot}>
                  {q.price && <span className={s.price}>{renderPrice(q.price)}</span>}
                  <a className={`${s.btn} ${s.btnGhost}`} href="#reservar">
                    Reservar
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comodidades(p: BlockProps<"comodidades">) {
  return (
    <section className={`${s.section} ${s.comodidades}`} id="comodidades">
      <div className={s.wrap}>
        {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
        <h2>{p.headline}</h2>
        <div className={s.amenGrid}>
          {p.items.map((c, i) => (
            <div className={s.amen} key={i}>
              <span className={s.ic} aria-hidden="true">
                {c.icon}
              </span>
              <b>{c.label}</b>
              {c.description && <p>{c.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Experiencias(p: BlockProps<"experiencias">) {
  return (
    <section className={s.section} id="experiencias">
      <div className={s.wrap}>
        {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
        <h2>{p.headline}</h2>
        {p.subtitle && <p className={s.lead}>{p.subtitle}</p>}
        <div className={s.expGrid}>
          {p.items.map((e, i) => (
            <article className={s.exp} key={i}>
              {e.image ? <img src={e.image} alt={e.name} /> : <div className={s.expFallback} />}
              <div className={s.expBody}>
                <h3>{e.name}</h3>
                {e.description && <p>{e.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CalytourTira(p: BlockProps<"calytour-tira">) {
  return (
    <div className={s.wrap}>
      <div className={s.calyStrip}>
        <p>{p.text}</p>
        <a href={p.cta.url}>{p.cta.label}</a>
      </div>
    </div>
  );
}

function CalytourDestacada(p: BlockProps<"calytour-destacada">) {
  return (
    <section className={`${s.section} ${s.calytour}`} id="calytour">
      <div className={s.wrap}>
        <div className={s.calytourInner}>
          <div>
            {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
            <h2>{p.headline}</h2>
            {p.body && <p>{p.body}</p>}
            {p.services.length > 0 && (
              <div className={s.calyServices}>
                {p.services.map((sv, i) => (
                  <div className={s.calyService} key={i}>
                    <span className={s.ic} aria-hidden="true">
                      {sv.icon}
                    </span>{" "}
                    {sv.label}
                  </div>
                ))}
              </div>
            )}
            <a className={`${s.btn} ${s.btnGhost}`} href={p.cta.url}>
              {p.cta.label}
            </a>
          </div>
          <div className={`${s.casaPhoto} ${s.calyPhoto}`}>
            <img src={CALY_PHOTO} alt="Destino dos passeios da Calytour" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Galeria(p: BlockProps<"galeria">) {
  return (
    <section className={s.section} id="galeria">
      <div className={s.wrap}>
        {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
        <h2>{p.headline}</h2>
        <div className={s.galeriaGrid}>
          {p.images.map((img, i) =>
            img.url ? (
              <img key={i} src={img.url} alt={img.alt} />
            ) : (
              <div className={s.galeriaTile} key={i}>
                <span>{img.alt}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function Localizacao(p: BlockProps<"localizacao">) {
  return (
    <section className={`${s.section} ${s.loc}`} id="localizacao">
      <div className={s.wrap}>
        {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
        <h2>{p.headline}</h2>
        <div className={s.locGrid}>
          <div className={s.locCard}>
            {p.body && (
              <p className={s.lead} style={{ margin: "0 0 4px" }}>
                {p.body}
              </p>
            )}
            <ul>
              {p.facts.map((f, i) => (
                <li key={i}>
                  <span className={s.ic} aria-hidden="true">
                    {f.icon}
                  </span>
                  <div>{renderLines(f.label)}</div>
                </li>
              ))}
            </ul>
          </div>
          <div
            className={s.mapEmbed}
            role="img"
            aria-label="Mapa ilustrativo da localização do hostel em Vila do Abraão, Ilha Grande"
          >
            <div>
              <div className={s.mapPin} aria-hidden="true">
                📍
              </div>
              <strong style={{ display: "block", fontFamily: "var(--font-display)" }}>
                Vila do Abraão
              </strong>
              <span style={{ fontSize: 14 }}>Ilha Grande · RJ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reservar(p: BlockProps<"reservar">) {
  const waNumber = (p.aside.cta.url.match(/(\d{6,})/) || [])[1] || "5524981566842";
  return (
    <section className={`${s.section} ${s.reservar}`} id="reservar">
      <div className={s.wrap}>
        {p.eyebrow && <p className={s.eyebrow}>{p.eyebrow}</p>}
        <h2>{p.headline}</h2>
        {p.subtitle && <p className={s.lead}>{p.subtitle}</p>}
        <div className={s.reservarGrid}>
          <ReservarForm waNumber={waNumber} />
          <aside className={s.formAside}>
            {p.aside.headline && <h3>{p.aside.headline}</h3>}
            {p.aside.body && <p>{p.aside.body}</p>}
            {p.aside.facts.length > 0 && (
              <p style={{ marginTop: 18 }}>
                {p.aside.facts.map((f, i) => (
                  <Fragment key={i}>
                    {i > 0 && <br />}
                    {i === 0 ? <b>{f.label}</b> : f.label}
                  </Fragment>
                ))}
              </p>
            )}
            <a className={`${s.btn} ${s.btnWa}`} href={p.aside.cta.url} target="_blank" rel="noopener">
              {p.aside.cta.label}
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Footer(p: BlockProps<"footer">) {
  return (
    <footer className={s.siteFooter}>
      <div className={`${s.wrap} ${s.footerGrid}`}>
        <div>
          <div className={s.footerBrand}>
            <img src="/logo-hostel.jpg" alt="Logo do Ilha Grande Hostel" />
            <b>{p.brandName}</b>
          </div>
          {p.brandDescription && <p style={{ marginTop: 14 }}>{p.brandDescription}</p>}
          {p.socialLinks.length > 0 && (
            <div className={s.social}>
              {p.socialLinks.map((l, i) => (
                <a key={i} href={l.url} aria-label={l.label} target="_blank" rel="noopener">
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
        {p.columns.map((col, i) => (
          <div className={s.footerCol} key={i}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l, j) => (
                <li key={j}>
                  <a href={l.url}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`${s.wrap} ${s.footerBottom}`}>
        <span>{p.copyright}</span>
        <span>
          Passeios por <a href="#calytour">Calytour</a> · Fotos por @____ (drone){" "}
          {/* TODO-HUMANO: handle do fotógrafo do drone para o crédito */}
        </span>
      </div>
    </footer>
  );
}

export const components: Record<BlockType, (props: any) => JSX.Element> = {
  hero: Hero,
  sobre: Sobre,
  vozes: VozesCarousel,
  quartos: Quartos,
  comodidades: Comodidades,
  experiencias: Experiencias,
  "calytour-destacada": CalytourDestacada,
  "calytour-tira": CalytourTira,
  galeria: Galeria,
  localizacao: Localizacao,
  reservar: Reservar,
  footer: Footer,
};

const conceito1Theme = { components, tokens };
export default conceito1Theme;
