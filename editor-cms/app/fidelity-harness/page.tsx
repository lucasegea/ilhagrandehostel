import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core/rsc";
import "@puckeditor/core/puck.css";
import { config } from "../../lib/puck.config";
import { loadPage } from "../../lib/content";

/**
 * Dev-only fidelity harness (7.D). Renders the ACTIVE theme with the seed page.json
 * that mirrors proposals/conceito-1/index.html's exact demo content, so the visual
 * diff vs the external mockup baseline measures SHAPE only, not content. Never served
 * in production.
 */
export const dynamic = "force-dynamic";

export default async function FidelityHarness() {
  if (process.env.NODE_ENV === "production") notFound();
  const data = await loadPage("_fidelity");
  return <Render config={config} data={data} />;
}
