import type { Config } from "@puckeditor/core";
import { activeComponents } from "../themes";
import type { BlockType } from "./blocks";

/**
 * One Puck config (Atlas Seam 3). For each block type it declares:
 *  - fields: Puck's editing DSL, mirroring the zod shape in lib/blocks.ts.
 *  - defaultProps: what a freshly inserted block carries (Puck assigns `id`).
 *  - render: a thin dispatcher to the ACTIVE theme component.
 * Swapping THEME swaps render output; the config and the page.json never change.
 * This same config drives both the public <Render> (/) and the <Puck> editor (/admin),
 * which is what gives WYSIWYG parity for free.
 */

const cta = {
  type: "object" as const,
  objectFields: {
    label: { type: "text" as const },
    url: { type: "text" as const },
  },
};

// Seam 6: a block type with no theme component renders nothing + a warn (not an
// error), so a contract/theme mismatch never white-screens the page.
function makeRender(type: BlockType) {
  const Component = (props: Record<string, unknown>) => {
    const C = activeComponents[type];
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

export const config: Config = {
  components: {
    hero: {
      fields: {
        eyebrow: { type: "text" },
        headline: { type: "text" },
        subtitle: { type: "textarea" },
        heroImage: { type: "text" },
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
      render: makeRender("hero"),
    },

    sobre: {
      fields: {
        eyebrow: { type: "text" },
        headline: { type: "text" },
        body: { type: "textarea" },
        image: { type: "text" },
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
      render: makeRender("sobre"),
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
      render: makeRender("vozes"),
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
            image: { type: "text" },
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
      render: makeRender("quartos"),
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
      render: makeRender("comodidades"),
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
            image: { type: "text" },
            duration: { type: "text" },
            tag: { type: "text" },
          },
          getItemSummary: (i: any) => i.name || "Experiência",
        },
      },
      defaultProps: { eyebrow: "", headline: "Experiências", subtitle: "", items: [] },
      render: makeRender("experiencias"),
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
      render: makeRender("calytour-destacada"),
    },

    "calytour-tira": {
      fields: { text: { type: "text" }, cta },
      defaultProps: {
        text: "Passeios e translados com a Calytour.",
        cta: { label: "WhatsApp", url: "https://wa.me/5524981566842" },
      },
      render: makeRender("calytour-tira"),
    },

    galeria: {
      fields: {
        eyebrow: { type: "text" },
        headline: { type: "text" },
        images: {
          type: "array",
          arrayFields: { url: { type: "text" }, alt: { type: "text" } },
          getItemSummary: (i: any) => i.alt || "Imagem",
        },
      },
      defaultProps: { eyebrow: "", headline: "Galeria", images: [] },
      render: makeRender("galeria"),
    },

    localizacao: {
      fields: {
        eyebrow: { type: "text" },
        headline: { type: "text" },
        body: { type: "textarea" },
        image: { type: "text" },
        facts: {
          type: "array",
          arrayFields: { icon: { type: "text" }, label: { type: "text" } },
          getItemSummary: (i: any) => i.label || "Fato",
        },
      },
      defaultProps: { eyebrow: "", headline: "Localização", body: "", facts: [] },
      render: makeRender("localizacao"),
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
      render: makeRender("reservar"),
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
      render: makeRender("footer"),
    },
  },
};
