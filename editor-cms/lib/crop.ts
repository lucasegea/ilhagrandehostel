/**
 * Crop geometry + bake (recorte real, D-crop). The IO-free piece — mapCropToSource —
 * is factored out so it is unit-testable in isolation (same posture as lib/blob-upload.ts)
 * with an executable home in tests/crop.mjs. The DOM piece — bakeCrop — is a thin wrapper
 * over <canvas> that produces the cropped Blob the editor uploads.
 *
 * Crop is 100% client-side: the user adjusts a rectangle over the picked image, we bake
 * ONLY that region to a canvas and upload the baked blob. The original never reaches the
 * store. See brain/output/architecture/ilhagrande-crop.md for the four pinned decisions.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Map a crop rectangle expressed in DISPLAYED CSS pixels (the on-screen size of the
 * <img> content box) to SOURCE pixels (the image's intrinsic naturalWidth/Height).
 *
 * Pure: no DOM, no devicePixelRatio — the displayed box is measured by the caller and
 * the scale is purely natural/displayed, so DPR cancels out. The result is clamped to
 * the source bounds [0,natural], rounded to integers, with w/h >= 1, so an overflowing
 * or inverted input can never produce an out-of-range or empty crop.
 */
export function mapCropToSource(
  displayRect: Rect,
  displayed: { w: number; h: number },
  natural: { w: number; h: number },
): Rect {
  const sx = natural.w / displayed.w;
  const sy = natural.h / displayed.h;

  // Source-space rect before clamping (may overflow / go negative).
  let left = displayRect.x * sx;
  let top = displayRect.y * sy;
  let right = (displayRect.x + displayRect.w) * sx;
  let bottom = (displayRect.y + displayRect.h) * sy;

  // Normalize inverted rects (right < left), then clamp each edge to the source bounds.
  if (right < left) [left, right] = [right, left];
  if (bottom < top) [bottom, top] = [top, bottom];

  left = Math.max(0, Math.min(left, natural.w));
  right = Math.max(0, Math.min(right, natural.w));
  top = Math.max(0, Math.min(top, natural.h));
  bottom = Math.max(0, Math.min(bottom, natural.h));

  const x = Math.round(left);
  const y = Math.round(top);
  const w = Math.max(1, Math.round(right - left));
  const h = Math.max(1, Math.round(bottom - top));

  // A 1px floor on a degenerate crop must not push the rect past the right/bottom edge.
  return {
    x: Math.min(x, natural.w - w),
    y: Math.min(y, natural.h - h),
    w,
    h,
  };
}

// Content types canvas can raster-crop. SVG is vector and GIF would lose its animation,
// so both bypass the cropper and upload as-is (decision (e) in the architecture note).
const RASTER_CROPPABLE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function isRasterCroppable(mime: string): boolean {
  return RASTER_CROPPABLE.has(mime);
}

/**
 * Output type for the baked blob. png/webp are preserved (already well-compressed,
 * lossless-or-better); everything else (jpeg, avif, unknown) bakes to jpeg @0.9 so a
 * cropped photo does not balloon vs the original. Every returned type is inside
 * IMAGE_CONTENT_TYPES, so the minted upload token accepts it.
 */
export function pickOutputType(sourceMime: string): { type: string; quality?: number } {
  if (sourceMime === "image/png") return { type: "image/png" };
  if (sourceMime === "image/webp") return { type: "image/webp" };
  return { type: "image/jpeg", quality: 0.9 };
}

/**
 * Bake the source rect of a loaded image into a Blob via an offscreen canvas. img must
 * be fully loaded (naturalWidth/Height resolved). Rejects fail-clear if the 2D context
 * or toBlob is unavailable rather than uploading a blank or wrong blob.
 */
export function bakeCrop(
  img: CanvasImageSource & { naturalWidth?: number },
  src: Rect,
  out: { type: string; quality?: number },
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = src.w;
  canvas.height = src.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject(new Error("contexto 2d do canvas indisponível"));
  }
  ctx.drawImage(img, src.x, src.y, src.w, src.h, 0, 0, src.w, src.h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob retornou null"))),
      out.type,
      out.quality,
    );
  });
}
