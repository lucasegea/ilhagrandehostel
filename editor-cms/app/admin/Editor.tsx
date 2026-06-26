"use client";

import { useMemo, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { buildConfig } from "../../lib/puck.config";
import { themeForSite } from "../../themes";
import type { Site } from "../../lib/sites";
import { publish } from "./actions";

/**
 * Client editor (M3, Atlas Seam 5; multi-site D-CALY-5). Renders Puck over the config
 * built from the EDITED site's theme, so the editor preview matches that site's public
 * route (WYSIWYG parity per site). Publish passes the site to the server action, which
 * re-validates it and writes back to the same site (savePage), saving locally and
 * committing to GitHub (git-as-DB, M4).
 */
const SITE_TITLE: Record<Site, string> = {
  ilhagrande: "Ilha Grande Hostel",
  calytour: "Calytour",
};

export default function Editor({ site, initialData }: { site: Site; initialData: Data }) {
  const [status, setStatus] = useState<string>("");
  const config = useMemo(() => buildConfig(themeForSite(site).components), [site]);

  return (
    <div style={{ height: "100vh" }}>
      <Puck
        config={config}
        data={initialData}
        onPublish={async (data) => {
          setStatus("Salvando...");
          const res = await publish(site, data);
          setStatus(res.ok ? "Salvo." : `Erro: ${res.error}`);
        }}
        headerTitle={SITE_TITLE[site]}
        headerPath={status}
      />
    </div>
  );
}
