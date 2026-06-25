import type { CSSProperties } from "react";
import type { BlockProps, BlockType } from "../../lib/blocks";

/**
 * Base theme (Atlas Seam 4): one minimal real theme that renders all 12 blocks
 * legibly with the brand tokens. NOT the definitive design — enough for AC2.1.
 * All components are presentational and server-safe (no client hooks) so the
 * public RSC <Render> and the /admin <Puck> preview share them (WYSIWYG parity).
 */

export const tokens = {
  terracota: "#A0461E",
  creme: "#FBFBDF",
  areiaClara: "#ECEBD9",
  areia: "#E6DEC6",
  tinta: "#3B2418",
  verde: "#2F5135",
  teal: "#2C6E72",
  ambar: "#C9893F",
};

const MAX = 1080;

const wrap: CSSProperties = {
  maxWidth: MAX,
  margin: "0 auto",
  padding: "0 24px",
};

function Section({
  id,
  children,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section id={id} style={{ padding: "72px 0", ...style }}>
      <div style={wrap}>{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      style={{
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        fontSize: 13,
        fontWeight: 600,
        color: tokens.teal,
        margin: "0 0 8px",
      }}
    >
      {children}
    </p>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 34, lineHeight: 1.1, margin: "0 0 12px" }}>{children}</h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p style={{ fontSize: 18, color: tokens.tinta, opacity: 0.8, margin: "0 0 28px" }}>
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: tokens.areia,
        color: tokens.tinta,
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

function ButtonLink({
  label,
  url,
  variant = "solid",
}: {
  label: string;
  url: string;
  variant?: "solid" | "ghost";
}) {
  const solid: CSSProperties = {
    background: tokens.terracota,
    color: tokens.creme,
    border: `2px solid ${tokens.terracota}`,
  };
  const ghost: CSSProperties = {
    background: "transparent",
    color: tokens.terracota,
    border: `2px solid ${tokens.terracota}`,
  };
  return (
    <a
      href={url}
      style={{
        display: "inline-block",
        padding: "12px 22px",
        borderRadius: 10,
        fontWeight: 600,
        textDecoration: "none",
        ...(variant === "solid" ? solid : ghost),
      }}
    >
      {label}
    </a>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${tokens.areia}`,
        borderRadius: 16,
        padding: 22,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function grid(min: number): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
    gap: 20,
  };
}

// --- blocks ---

function Hero(p: BlockProps<"hero">) {
  return (
    <section
      style={{
        background: `linear-gradient(160deg, ${tokens.teal}, ${tokens.verde})`,
        color: tokens.creme,
        padding: "96px 0",
      }}
    >
      <div style={wrap}>
        <p style={{ letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 13, opacity: 0.85 }}>
          {p.eyebrow}
        </p>
        <h1 style={{ fontSize: 52, lineHeight: 1.05, margin: "10px 0 16px", color: tokens.creme }}>
          {p.headline}
        </h1>
        <p style={{ fontSize: 20, maxWidth: 620, opacity: 0.95, margin: "0 0 28px" }}>{p.subtitle}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          {p.ctas.map((c, i) => (
            <a
              key={i}
              href={c.url}
              style={{
                display: "inline-block",
                padding: "13px 24px",
                borderRadius: 10,
                fontWeight: 600,
                textDecoration: "none",
                background: i === 0 ? tokens.ambar : "transparent",
                color: i === 0 ? tokens.tinta : tokens.creme,
                border: `2px solid ${i === 0 ? tokens.ambar : tokens.creme}`,
              }}
            >
              {c.label}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {p.badges.map((b, i) => (
            <span
              key={i}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.16)",
                fontSize: 14,
              }}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sobre(p: BlockProps<"sobre">) {
  const cards = p.values.length ? p.values : [];
  return (
    <Section id="sobre" style={{ background: tokens.creme }}>
      <Eyebrow>{p.eyebrow}</Eyebrow>
      <Heading>{p.headline}</Heading>
      <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 720, margin: "0 0 28px" }}>{p.body}</p>
      {cards.length > 0 && (
        <div style={grid(220)}>
          {cards.map((v, i) => (
            <Card key={i}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{v.icon}</div>
              <h3 style={{ margin: "0 0 6px", fontSize: 19 }}>{v.title}</h3>
              <p style={{ margin: 0, opacity: 0.8 }}>{v.description}</p>
            </Card>
          ))}
        </div>
      )}
      {p.amenities.length > 0 && (
        <div style={{ ...grid(220), marginTop: 20 }}>
          {p.amenities.map((a, i) => (
            <Card key={i}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>{a.label}</h3>
              <p style={{ margin: 0, opacity: 0.8 }}>{a.description}</p>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}

function Vozes(p: BlockProps<"vozes">) {
  return (
    <Section id="vozes" style={{ background: tokens.areiaClara }}>
      <Eyebrow>{p.eyebrow}</Eyebrow>
      <Heading>{p.headline}</Heading>
      <Sub>{p.subtitle}</Sub>
      <div style={grid(260)}>
        {p.items.map((it, i) => (
          <Card key={i}>
            <div style={{ color: tokens.ambar, marginBottom: 8, fontSize: 16 }}>{it.stars}</div>
            <p style={{ fontStyle: "italic", margin: "0 0 12px", lineHeight: 1.5 }}>“{it.quote}”</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{it.name}</p>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>
              {[it.city, it.source].filter(Boolean).join(" · ")}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Quartos(p: BlockProps<"quartos">) {
  return (
    <Section id="quartos" style={{ background: tokens.creme }}>
      <Eyebrow>{p.eyebrow}</Eyebrow>
      <Heading>{p.headline}</Heading>
      <Sub>{p.subtitle}</Sub>
      <div style={grid(280)}>
        {p.items.map((q, i) => (
          <Card key={i} style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                height: 150,
                background: q.image
                  ? `center/cover url(${q.image})`
                  : `linear-gradient(135deg, ${tokens.areia}, ${tokens.ambar})`,
              }}
            />
            <div style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>{q.name}</h3>
              <p style={{ margin: "0 0 10px", opacity: 0.8 }}>{q.description}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {q.meta.map((m, j) => (
                  <Pill key={j}>{m.label}</Pill>
                ))}
              </div>
              <p style={{ margin: 0, fontWeight: 700, color: tokens.terracota, fontSize: 18 }}>
                {q.price}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Comodidades(p: BlockProps<"comodidades">) {
  return (
    <Section id="comodidades" style={{ background: tokens.areiaClara }}>
      <Eyebrow>{p.eyebrow}</Eyebrow>
      <Heading>{p.headline}</Heading>
      <div style={grid(200)}>
        {p.items.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 26 }}>{c.icon}</div>
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>{c.label}</p>
              {c.description && <p style={{ margin: 0, opacity: 0.75, fontSize: 14 }}>{c.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Experiencias(p: BlockProps<"experiencias">) {
  return (
    <Section id="experiencias" style={{ background: tokens.creme }}>
      <Eyebrow>{p.eyebrow}</Eyebrow>
      <Heading>{p.headline}</Heading>
      <Sub>{p.subtitle}</Sub>
      <div style={grid(260)}>
        {p.items.map((e, i) => (
          <Card key={i} style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                height: 130,
                background: e.image
                  ? `center/cover url(${e.image})`
                  : `linear-gradient(135deg, ${tokens.teal}, ${tokens.verde})`,
              }}
            />
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 19 }}>{e.name}</h3>
                {e.tag && <Pill>{e.tag}</Pill>}
              </div>
              <p style={{ margin: "0 0 8px", opacity: 0.8 }}>{e.description}</p>
              {e.duration && (
                <p style={{ margin: 0, fontSize: 14, color: tokens.teal, fontWeight: 600 }}>
                  {e.duration}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function CalytourDestacada(p: BlockProps<"calytour-destacada">) {
  return (
    <section style={{ background: tokens.verde, color: tokens.creme, padding: "72px 0" }}>
      <div style={wrap}>
        <p style={{ letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 13, opacity: 0.85 }}>
          {p.eyebrow}
        </p>
        <h2 style={{ fontSize: 34, margin: "8px 0 12px", color: tokens.creme }}>{p.headline}</h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 680, opacity: 0.95, margin: "0 0 24px" }}>
          {p.body}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {p.services.map((s, i) => (
            <span
              key={i}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                fontSize: 15,
              }}
            >
              {s.icon} {s.label}
            </span>
          ))}
        </div>
        <a
          href={p.cta.url}
          style={{
            display: "inline-block",
            padding: "13px 24px",
            borderRadius: 10,
            fontWeight: 600,
            textDecoration: "none",
            background: tokens.ambar,
            color: tokens.tinta,
          }}
        >
          {p.cta.label}
        </a>
      </div>
    </section>
  );
}

function CalytourTira(p: BlockProps<"calytour-tira">) {
  return (
    <div style={{ background: tokens.ambar, color: tokens.tinta, padding: "16px 0" }}>
      <div
        style={{
          ...wrap,
          display: "flex",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 600 }}>{p.text}</span>
        <a href={p.cta.url} style={{ fontWeight: 700, color: tokens.tinta }}>
          {p.cta.label}
        </a>
      </div>
    </div>
  );
}

function Galeria(p: BlockProps<"galeria">) {
  return (
    <Section id="galeria" style={{ background: tokens.areiaClara }}>
      <Eyebrow>{p.eyebrow}</Eyebrow>
      <Heading>{p.headline}</Heading>
      <div style={grid(220)}>
        {p.images.map((img, i) => (
          <div
            key={i}
            style={{
              height: 180,
              borderRadius: 14,
              overflow: "hidden",
              background: img.url
                ? `center/cover url(${img.url})`
                : `linear-gradient(135deg, ${tokens.teal}, ${tokens.ambar})`,
              display: "flex",
              alignItems: "flex-end",
              color: tokens.creme,
            }}
          >
            {!img.url && (
              <span style={{ padding: 12, fontSize: 14, fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,.4)" }}>
                {img.alt}
              </span>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Localizacao(p: BlockProps<"localizacao">) {
  return (
    <Section id="localizacao" style={{ background: tokens.creme }}>
      <Eyebrow>{p.eyebrow}</Eyebrow>
      <Heading>{p.headline}</Heading>
      <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 680, margin: "0 0 24px" }}>{p.body}</p>
      <div style={grid(240)}>
        {p.facts.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>{f.icon}</span>
            <span style={{ fontWeight: 500 }}>{f.label}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Reservar(p: BlockProps<"reservar">) {
  const input: CSSProperties = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 8,
    border: `1px solid ${tokens.areia}`,
    fontSize: 15,
    marginBottom: 12,
    background: "#fff",
  };
  return (
    <Section id="reservar" style={{ background: tokens.areia }}>
      <Eyebrow>{p.eyebrow}</Eyebrow>
      <Heading>{p.headline}</Heading>
      <Sub>{p.subtitle}</Sub>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
        <Card>
          <input style={input} placeholder="Nome" />
          <input style={input} placeholder="E-mail" />
          <div style={{ display: "flex", gap: 12 }}>
            <input style={input} placeholder="Check-in" />
            <input style={input} placeholder="Check-out" />
          </div>
          <input style={input} placeholder="Hóspedes" />
          <ButtonLink label="Pedir reserva" url="#reservar" />
        </Card>
        <div>
          <h3 style={{ marginTop: 0 }}>{p.aside.headline}</h3>
          <p style={{ lineHeight: 1.6, opacity: 0.85 }}>{p.aside.body}</p>
          <div style={{ margin: "16px 0" }}>
            <ButtonLink label={p.aside.cta.label} url={p.aside.cta.url} variant="ghost" />
          </div>
          <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
            {p.aside.facts.map((f, i) => (
              <li key={i}>{f.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Footer(p: BlockProps<"footer">) {
  return (
    <footer style={{ background: tokens.tinta, color: tokens.creme, padding: "56px 0 28px" }}>
      <div style={{ ...wrap, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
        <div>
          <h3 style={{ margin: "0 0 10px", color: tokens.creme }}>{p.brandName}</h3>
          <p style={{ opacity: 0.8, lineHeight: 1.6 }}>{p.brandDescription}</p>
          <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
            {p.socialLinks.map((s, i) => (
              <a key={i} href={s.url} style={{ color: tokens.ambar, fontWeight: 600 }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
        {p.columns.map((col, i) => (
          <div key={i}>
            <h4 style={{ margin: "0 0 10px", color: tokens.creme }}>{col.title}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2 }}>
              {col.links.map((l, j) => (
                <li key={j}>
                  <a href={l.url} style={{ color: tokens.creme, opacity: 0.85, textDecoration: "none" }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ ...wrap, marginTop: 32, opacity: 0.6, fontSize: 14 }}>{p.copyright}</div>
    </footer>
  );
}

export const components: Record<BlockType, (props: any) => JSX.Element> = {
  hero: Hero,
  sobre: Sobre,
  vozes: Vozes,
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

const baseTheme = { components, tokens };
export default baseTheme;
