"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

/**
 * Custom Puck field for image props (M6, D-106). Shows the current Blob URL, a small
 * thumbnail when one is set, and an upload button. Picking a file uploads it DIRECTLY
 * from the browser to Vercel Blob via the SDK's `upload()` (client-direct, so files
 * larger than the ~4.5 MB serverless body limit are supported: the bytes never transit
 * our function), authorized by a short-lived, image-scoped token minted at
 * /api/blob/upload. On success the public Blob URL is pushed back into Puck via
 * onChange, so it lands in the field's prop and, on publish, in page.json (git-as-DB).
 *
 * This is the ONLY module that imports @vercel/blob/client, and it is a "use client"
 * component, so the import lives entirely in the editor/client bundle and never reaches
 * the RSC public-render graph (puck.config.tsx is shared by both the editor and the
 * server Render; the field's render only runs in the editor).
 *
 * Fail-clear: an upload error surfaces a readable message in the editor and is never
 * swallowed. The field keeps its previous value on failure, so a failed pick can never
 * silently blank an existing image.
 */
export function ImageUploadField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });
      onChange(result.url);
    } catch (err) {
      // No silent fallback: show the real reason, keep the prior value intact.
      setError((err as Error).message || "Falha no upload da imagem.");
    } finally {
      setUploading(false);
      // Reset the input so re-picking the SAME file fires onChange again.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- Blob URLs are arbitrary external hosts; the editor preview does not need next/image optimization.
        <img
          src={value}
          alt=""
          style={{
            width: "100%",
            maxHeight: 140,
            objectFit: "cover",
            borderRadius: 6,
            border: "1px solid #e2e2e2",
          }}
        />
      ) : null}

      <input
        type="text"
        readOnly
        value={value ?? ""}
        placeholder="Nenhuma imagem"
        style={{
          width: "100%",
          fontSize: 12,
          padding: "6px 8px",
          border: "1px solid #e2e2e2",
          borderRadius: 6,
          background: "#fafafa",
          color: "#555",
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: "6px 10px",
          border: "1px solid #d0d0d0",
          borderRadius: 6,
          background: uploading ? "#f0f0f0" : "#fff",
          cursor: uploading ? "default" : "pointer",
          fontSize: 13,
        }}
      >
        {uploading ? "Enviando..." : value ? "Trocar imagem" : "Enviar imagem"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handlePick}
        style={{ display: "none" }}
      />

      {error ? (
        <p style={{ color: "#b00020", fontSize: 12, margin: 0 }}>{error}</p>
      ) : null}
    </div>
  );
}
