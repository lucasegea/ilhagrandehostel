"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { isRasterCroppable } from "../../lib/crop";
import { ImageCropper } from "./ImageCropper";

/**
 * Custom Puck field for image props (M6 D-106; recorte real D-crop). Shows the current
 * Blob URL, a small thumbnail when one is set, and an upload button. Picking a RASTER
 * image (jpeg/png/webp/avif) now opens a crop rectangle FIRST: the user adjusts it and we
 * upload the baked, cropped blob, never the original (decisions a/b/c/d in
 * brain/output/architecture/ilhagrande-crop.md). Non-raster picks (SVG vector, animated
 * GIF) bypass the cropper and upload as-is (decision e): canvas cannot meaningfully crop
 * them.
 *
 * The upload itself is unchanged: a client-direct PUT straight to Vercel Blob via the
 * SDK's `upload()`, authorized by a short-lived image-scoped token minted at
 * /api/blob/upload. On success the public Blob URL is pushed back into Puck via onChange,
 * so it lands in the field's prop and, on publish, in page.json (git-as-DB).
 *
 * This is the ONLY module that imports @vercel/blob/client, and it is a "use client"
 * component, so the import lives entirely in the editor/client bundle and never reaches
 * the RSC public-render graph. The `uploader` prop is a test seam that defaults to the
 * real SDK `upload`; Puck never passes it, so production behavior is identical.
 *
 * Fail-clear: an upload (or crop) error surfaces a readable message in the editor and is
 * never swallowed. The field keeps its previous value on failure, so a failed pick can
 * never silently blank an existing image.
 */
export function ImageUploadField({
  value,
  onChange,
  uploader = upload,
}: {
  value?: string;
  onChange: (value: string) => void;
  uploader?: typeof upload;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  // Crop state: the picked file + a local objectURL, set only for raster picks. Null when
  // not cropping. Kept as one object so cancel/confirm/error all clear it atomically.
  const [crop, setCrop] = useState<{ file: File; url: string } | null>(null);

  function revokeCrop() {
    if (crop) URL.revokeObjectURL(crop.url);
    setCrop(null);
  }

  async function uploadBlob(name: string, blob: Blob) {
    setUploading(true);
    setError("");
    try {
      const result = await uploader(name, blob, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });
      onChange(result.url);
    } catch (err) {
      // No silent fallback: show the real reason, keep the prior value intact.
      setError((err as Error).message || "Falha no upload da imagem.");
    } finally {
      setUploading(false);
    }
  }

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so re-picking the SAME file fires onChange again.
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setError("");
    if (isRasterCroppable(file.type)) {
      setCrop({ file, url: URL.createObjectURL(file) });
    } else {
      // SVG / GIF / unknown: no canvas crop, upload as-is (decision e).
      void uploadBlob(file.name, file);
    }
  }

  function handleConfirmCrop(blob: Blob) {
    const name = crop?.file.name ?? "imagem";
    revokeCrop();
    void uploadBlob(name, blob);
  }

  function handleCancelCrop() {
    revokeCrop();
  }

  if (crop) {
    return (
      <ImageCropper
        src={crop.url}
        sourceMime={crop.file.type}
        onConfirm={handleConfirmCrop}
        onCancel={handleCancelCrop}
      />
    );
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
