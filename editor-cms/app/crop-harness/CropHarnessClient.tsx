"use client";

import { useState } from "react";
import type { upload } from "@vercel/blob/client";
import { ImageUploadField } from "../admin/ImageUploadField";

// A valid (loadable) 1x1 png data URL stands in for a previously-saved image, so the
// preexisting-value thumbnail renders without a network error polluting the console gate.
const PREEXISTING =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * Stub uploader injected in place of the real Vercel Blob `upload()`. It intercepts the
 * baked blob, measures its pixel dimensions via createImageBitmap, and stashes them on
 * window so the Playwright test can assert the upload is the cropped region. It returns a
 * real blob: object URL of the cropped image (loadable by the preview <img>, so the
 * zero-console-error gate keeps its teeth) and throws when window.__forceUploadError is
 * set, to exercise the field's fail-clear path.
 */
const stubUploader = (async (name: string, body: Blob) => {
  const w = window as unknown as {
    __forceUploadError?: boolean;
    __lastUpload?: unknown;
    __uploadCount?: number;
  };
  w.__uploadCount = (w.__uploadCount ?? 0) + 1;
  if (w.__forceUploadError) {
    throw new Error("upload falhou (stub)");
  }
  const bmp = await createImageBitmap(body);
  w.__lastUpload = { name, w: bmp.width, h: bmp.height, type: body.type, size: body.size };
  bmp.close?.();
  return { url: URL.createObjectURL(body) };
}) as unknown as typeof upload;

export function CropHarnessClient() {
  const [value, setValue] = useState(PREEXISTING);
  return (
    <div style={{ padding: 20, maxWidth: 520 }}>
      <h1 style={{ fontSize: 16 }}>crop harness (dev-only)</h1>
      <div data-testid="field-value">{value}</div>
      <ImageUploadField value={value} onChange={setValue} uploader={stubUploader} />
    </div>
  );
}
