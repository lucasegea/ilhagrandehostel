import { z } from "zod";

/**
 * Block contract (D-101). Single source of truth for the content model.
 * Zod-first: every block is a schema here; TS types are z.infer of these.
 * The Puck field DSL in lib/puck.config.tsx mirrors these shapes for the editor;
 * this file is what `npm run validate:content` enforces against page.json.
 *
 * Field set per block is the UNION across the three design proposals
 * (proposals/conceito-{1,2,3}), so no proposal's section/field is missed and
 * any chosen theme can render the same page.json.
 */

// --- shared leaf schemas ---

/** A call-to-action: label + destination. url is free-form (anchor, tel:, https). */
const zCta = z.object({
  label: z.string(),
  url: z.string(),
});

/** An image URL. Plain string in v1; Blob URLs land here in M6. */
const zImage = z.string();

/** Richtext is plain/markdown string in v1 (no rich editor yet). */
const zRichText = z.string();

// --- per-block props ---
// Each props object carries Puck's managed `id` plus the content fields.

const heroProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  subtitle: z.string().default(""),
  heroImage: zImage.optional(),
  ctas: z.array(zCta).default([]),
  badges: z.array(z.object({ label: z.string() })).default([]),
});

const sobreProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  body: zRichText.default(""),
  image: zImage.optional(),
  // conceito-1 "values" / conceito-3 "amenities" both fold here; either may be empty.
  values: z
    .array(
      z.object({
        icon: z.string().default(""),
        title: z.string(),
        description: z.string().default(""),
      })
    )
    .default([]),
  amenities: z
    .array(
      z.object({
        icon: z.string().default(""),
        label: z.string(),
        description: z.string().default(""),
      })
    )
    .default([]),
});

const vozesProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  subtitle: z.string().default(""),
  items: z.array(
    z.object({
      stars: z.string().default("★★★★★"),
      quote: z.string(),
      name: z.string(),
      city: z.string().default(""),
      source: z.string().default(""),
    })
  ),
});

const quartosProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  subtitle: z.string().default(""),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string().default(""),
      price: z.string().default(""),
      image: zImage.optional(),
      meta: z.array(z.object({ label: z.string() })).default([]),
    })
  ),
});

const comodidadesProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  items: z.array(
    z.object({
      icon: z.string().default(""),
      label: z.string(),
      description: z.string().default(""),
    })
  ),
});

const experienciasProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  subtitle: z.string().default(""),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string().default(""),
      image: zImage.optional(),
      duration: z.string().optional(),
      tag: z.string().optional(),
    })
  ),
});

const calytourDestacadaProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  body: zRichText.default(""),
  services: z
    .array(z.object({ icon: z.string().default(""), label: z.string() }))
    .default([]),
  cta: zCta,
});

const calytourTiraProps = z.object({
  id: z.string(),
  text: z.string(),
  cta: zCta,
});

const galeriaProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  images: z.array(z.object({ url: zImage, alt: z.string().default("") })),
});

const localizacaoProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  body: zRichText.default(""),
  image: zImage.optional(),
  facts: z
    .array(z.object({ icon: z.string().default(""), label: z.string() }))
    .default([]),
});

const reservarProps = z.object({
  id: z.string(),
  eyebrow: z.string().default(""),
  headline: z.string(),
  subtitle: z.string().default(""),
  aside: z.object({
    headline: z.string().default(""),
    body: zRichText.default(""),
    cta: zCta,
    facts: z.array(z.object({ label: z.string() })).default([]),
  }),
});

const footerProps = z.object({
  id: z.string(),
  brandName: z.string(),
  brandDescription: z.string().default(""),
  socialLinks: z.array(zCta).default([]),
  columns: z
    .array(
      z.object({
        title: z.string(),
        links: z.array(zCta).default([]),
      })
    )
    .default([]),
  copyright: z.string().default(""),
});

/**
 * The block registry: maps every block type to its props schema.
 * The 12 types cover every section present across the three proposals.
 */
export const blockSchemas = {
  hero: heroProps,
  sobre: sobreProps,
  vozes: vozesProps,
  quartos: quartosProps,
  comodidades: comodidadesProps,
  experiencias: experienciasProps,
  "calytour-destacada": calytourDestacadaProps,
  "calytour-tira": calytourTiraProps,
  galeria: galeriaProps,
  localizacao: localizacaoProps,
  reservar: reservarProps,
  footer: footerProps,
} as const;

export type BlockType = keyof typeof blockSchemas;

export const BLOCK_TYPES = Object.keys(blockSchemas) as BlockType[];

// Discriminated union over `type` so an unknown type or a malformed block fails validation.
const zBlock = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hero"), props: heroProps }),
  z.object({ type: z.literal("sobre"), props: sobreProps }),
  z.object({ type: z.literal("vozes"), props: vozesProps }),
  z.object({ type: z.literal("quartos"), props: quartosProps }),
  z.object({ type: z.literal("comodidades"), props: comodidadesProps }),
  z.object({ type: z.literal("experiencias"), props: experienciasProps }),
  z.object({ type: z.literal("calytour-destacada"), props: calytourDestacadaProps }),
  z.object({ type: z.literal("calytour-tira"), props: calytourTiraProps }),
  z.object({ type: z.literal("galeria"), props: galeriaProps }),
  z.object({ type: z.literal("localizacao"), props: localizacaoProps }),
  z.object({ type: z.literal("reservar"), props: reservarProps }),
  z.object({ type: z.literal("footer"), props: footerProps }),
]);

/** Puck page shape: { root, content[] }. zones are allowed but unused in v1. */
export const zPage = z.object({
  root: z.object({
    props: z.object({ title: z.string().default("") }).passthrough().optional(),
  }).passthrough(),
  content: z.array(zBlock),
  zones: z.record(z.any()).optional(),
});

export type PageData = z.infer<typeof zPage>;
export type BlockProps<T extends BlockType> = z.infer<(typeof blockSchemas)[T]>;
