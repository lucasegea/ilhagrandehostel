import { Render } from "@puckeditor/core/rsc";
import "@puckeditor/core/puck.css";
import { buildConfig } from "../lib/puck.config";
import { themeForSite } from "../themes";
import { loadPage } from "../lib/content";

// Re-read page.json on every request so a local /admin save shows here without a rebuild.
export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await loadPage("ilhagrande");
  const config = buildConfig(themeForSite("ilhagrande").components);
  return <Render config={config} data={data} />;
}
