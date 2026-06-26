import type { Metadata } from "next";
import { Render } from "@puckeditor/core/rsc";
import "@puckeditor/core/puck.css";
import { buildConfig } from "../../lib/puck.config";
import { themeForSite } from "../../themes";
import { loadPage } from "../../lib/content";

// Re-read page.json on every request so a local /admin?site=calytour save shows here
// without a rebuild.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calytour — Travel Company · Parceira do Ilha Grande Hostel",
  description:
    "Calytour: translados, passeios de barco, mergulho e excursões na Ilha Grande, Rio, Angra e Búzios. Parceira oficial do Ilha Grande Hostel.",
};

export default async function CalytourPage() {
  const data = await loadPage("calytour");
  const config = buildConfig(themeForSite("calytour").components);
  // Calytour's own page background (cool light), so the hostel's warm body texture
  // never bleeds behind the agency sections.
  return (
    <div style={{ background: "#f4f8fb", minHeight: "100vh" }}>
      <Render config={config} data={data} />
    </div>
  );
}
