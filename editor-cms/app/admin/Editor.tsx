"use client";

import { useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "../../lib/puck.config";
import { publish } from "./actions";

/**
 * Client editor (M3, Atlas Seam 5). Renders Puck over the SAME config the public
 * route uses, so the editor preview matches / (WYSIWYG parity). Publish here calls
 * the publish server action (savePage), which saves locally and commits to GitHub
 * (git-as-DB, M4).
 */
export default function Editor({ initialData }: { initialData: Data }) {
  const [status, setStatus] = useState<string>("");

  return (
    <div style={{ height: "100vh" }}>
      <Puck
        config={config}
        data={initialData}
        onPublish={async (data) => {
          setStatus("Salvando...");
          const res = await publish(data);
          setStatus(res.ok ? "Salvo." : `Erro: ${res.error}`);
        }}
        headerTitle="Ilha Grande Hostel"
        headerPath={status}
      />
    </div>
  );
}
