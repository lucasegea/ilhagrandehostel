import type { Config } from "@puckeditor/core";
import type { ThemeComponents } from "../themes";
import type { BlockType } from "./blocks";
import { ImageUploadField } from "../app/admin/ImageUploadField";

/**
 * Puck config builder (Atlas Seam 3, refactor D-CALY-2). The content model
 * (fields + defaultProps) is site-agnostic and shared by every site; only the
 * render target changes per theme. `buildConfig(components)` closes each block's
 * render over the PASSED theme components, so the public route, each per-site
 * public route, and the editor build their own config from `themeForSite(site)`.
 * Swapping the components swaps render output; the fields and the page.json never
 * change. This is what gives WYSIWYG parity for free, per site.
 */

const cta = {
  type: "object" as const,
  objectFields: {
    label: { type: "text" as const },
    url: { type: "text" as const },
  },
};

/**
 * Image fields (M6, D-106). A custom Puck field that uploads to Vercel Blob and writes
 * the public URL back into the prop. Shared by every image prop (hero/sobre/quartos/
 * experiencias/galeria/localizacao), including the ones nested inside arrayFields, the
 * same way `cta` is shared above. The render runs ONLY in the editor (Puck never calls
 * field renders during the server Render), and ImageUploadField is a "use client"
 * module, so importing it here keeps the @vercel/blob/client dependency out of the RSC
 * public-render graph that also imports this config.
 */
const imageField = {
  type: "custom" as const,
  render: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange: (value: string) => void;
  }) => <ImageUploadField value={value} onChange={onChange} />,
};

// Seam 6: a block type with no component in the active theme renders nothing + a
// warn (not an error), so a contract/theme mismatch never white-screens the page.
function makeRender(type: BlockType, components: ThemeComponents) {
  const Component = (props: Record<string, unknown>) => {
    const C = components[type];
    if (!C) {
      console.warn(`[puck.config] active theme has no component for block "${type}"`);
      return <></>;
    }
    // Puck injects a runtime `puck` prop carrying functions (renderDropZone, dragRef).
    // Server components ignore it, but a client-component theme cannot receive function
    // props across the RSC boundary. None of these blocks use it, so drop it here.
    const { puck, editMode, ...rest } = props;
    void puck;
    void editMode;
    return <C {...rest} />;
  };
  Component.displayName = `Render(${type})`;
  return Component;
}

export function buildConfig(components: ThemeComponents): Config {
  return {
    components: {
      hero: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          subtitle: { type: "textarea" },
          heroImage: imageField,
          ctas: {
            type: "array",
            arrayFields: { label: { type: "text" }, url: { type: "text" } },
            getItemSummary: (i: any) => i.label || "CTA",
          },
          badges: {
            type: "array",
            arrayFields: { label: { type: "text" } },
            getItemSummary: (i: any) => i.label || "Badge",
          },
        },
        defaultProps: {
          eyebrow: "",
          headline: "Novo título",
          subtitle: "",
          ctas: [],
          badges: [],
        },
        render: makeRender("hero", components),
      },

      sobre: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          body: { type: "textarea" },
          image: imageField,
          values: {
            type: "array",
            arrayFields: {
              icon: { type: "text" },
              title: { type: "text" },
              description: { type: "textarea" },
            },
            getItemSummary: (i: any) => i.title || "Item",
          },
          amenities: {
            type: "array",
            arrayFields: {
              icon: { type: "text" },
              label: { type: "text" },
              description: { type: "textarea" },
            },
            getItemSummary: (i: any) => i.label || "Item",
          },
        },
        defaultProps: { eyebrow: "", headline: "Sobre", body: "", values: [], amenities: [] },
        render: makeRender("sobre", components),
      },

      vozes: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          subtitle: { type: "text" },
          items: {
            type: "array",
            arrayFields: {
              stars: { type: "text" },
              quote: { type: "textarea" },
              name: { type: "text" },
              city: { type: "text" },
              source: { type: "text" },
            },
            getItemSummary: (i: any) => i.name || "Voz",
          },
        },
        defaultProps: { eyebrow: "", headline: "Vozes", subtitle: "", items: [] },
        render: makeRender("vozes", components),
      },

      quartos: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          subtitle: { type: "text" },
          items: {
            type: "array",
            arrayFields: {
              name: { type: "text" },
              description: { type: "textarea" },
              price: { type: "text" },
              image: imageField,
              meta: {
                type: "array",
                arrayFields: { label: { type: "text" } },
                getItemSummary: (i: any) => i.label || "Tag",
              },
            },
            getItemSummary: (i: any) => i.name || "Quarto",
          },
        },
        defaultProps: { eyebrow: "", headline: "Quartos", subtitle: "", items: [] },
        render: makeRender("quartos", components),
      },

      comodidades: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          items: {
            type: "array",
            arrayFields: {
              icon: { type: "text" },
              label: { type: "text" },
              description: { type: "textarea" },
            },
            getItemSummary: (i: any) => i.label || "Item",
          },
        },
        defaultProps: { eyebrow: "", headline: "Comodidades", items: [] },
        render: makeRender("comodidades", components),
      },

      experiencias: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          subtitle: { type: "text" },
          items: {
            type: "array",
            arrayFields: {
              name: { type: "text" },
              description: { type: "textarea" },
              image: imageField,
              duration: { type: "text" },
              tag: { type: "text" },
            },
            getItemSummary: (i: any) => i.name || "Experiência",
          },
        },
        defaultProps: { eyebrow: "", headline: "Experiências", subtitle: "", items: [] },
        render: makeRender("experiencias", components),
      },

      "calytour-destacada": {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          body: { type: "textarea" },
          services: {
            type: "array",
            arrayFields: { icon: { type: "text" }, label: { type: "text" } },
            getItemSummary: (i: any) => i.label || "Serviço",
          },
          cta,
        },
        defaultProps: {
          eyebrow: "",
          headline: "Calytour",
          body: "",
          services: [],
          cta: { label: "Falar com a Calytour", url: "https://wa.me/5524981566842" },
        },
        render: makeRender("calytour-destacada", components),
      },

      "calytour-tira": {
        fields: { text: { type: "text" }, cta },
        defaultProps: {
          text: "Passeios e translados com a Calytour.",
          cta: { label: "WhatsApp", url: "https://wa.me/5524981566842" },
        },
        render: makeRender("calytour-tira", components),
      },

      galeria: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          images: {
            type: "array",
            arrayFields: { url: imageField, alt: { type: "text" } },
            getItemSummary: (i: any) => i.alt || "Imagem",
          },
        },
        defaultProps: { eyebrow: "", headline: "Galeria", images: [] },
        render: makeRender("galeria", components),
      },

      localizacao: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          body: { type: "textarea" },
          image: imageField,
          facts: {
            type: "array",
            arrayFields: { icon: { type: "text" }, label: { type: "text" } },
            getItemSummary: (i: any) => i.label || "Fato",
          },
        },
        defaultProps: { eyebrow: "", headline: "Localização", body: "", facts: [] },
        render: makeRender("localizacao", components),
      },

      reservar: {
        fields: {
          eyebrow: { type: "text" },
          headline: { type: "text" },
          subtitle: { type: "text" },
          aside: {
            type: "object",
            objectFields: {
              headline: { type: "text" },
              body: { type: "textarea" },
              cta,
              facts: {
                type: "array",
                arrayFields: { label: { type: "text" } },
                getItemSummary: (i: any) => i.label || "Fato",
              },
            },
          },
        },
        defaultProps: {
          eyebrow: "",
          headline: "Reservar",
          subtitle: "",
          aside: {
            headline: "Prefere falar com a gente?",
            body: "",
            cta: { label: "WhatsApp", url: "https://wa.me/5524981566842" },
            facts: [],
          },
        },
        render: makeRender("reservar", components),
      },

      footer: {
        fields: {
          brandName: { type: "text" },
          brandDescription: { type: "textarea" },
          socialLinks: {
            type: "array",
            arrayFields: { label: { type: "text" }, url: { type: "text" } },
            getItemSummary: (i: any) => i.label || "Link",
          },
          columns: {
            type: "array",
            arrayFields: {
              title: { type: "text" },
              links: {
                type: "array",
                arrayFields: { label: { type: "text" }, url: { type: "text" } },
                getItemSummary: (i: any) => i.label || "Link",
              },
            },
            getItemSummary: (i: any) => i.title || "Coluna",
          },
          copyright: { type: "text" },
        },
        defaultProps: {
          brandName: "Ilha Grande Hostel",
          brandDescription: "",
          socialLinks: [],
          columns: [],
          copyright: "",
        },
        render: makeRender("footer", components),
      },
    },
  };
}
