"use client";

import { useEffect, useRef, useState } from "react";
import {
  type Rect,
  mapCropToSource,
  bakeCrop,
  pickOutputType,
} from "../../lib/crop";

/**
 * Free-form rectangular cropper (decisions (b) libre + (c) hand-roll, D-crop). Shows the
 * picked image at its natural aspect (no object-fit:cover, so the displayed content box
 * equals the element box and the display->source mapping is clean) with a draggable,
 * resizable rectangle over it. On confirm it measures the displayed box, maps the rect to
 * source pixels via the pure lib/crop helper, bakes ONLY that region to a Blob, and hands
 * it back. No upload, no auth, no Vercel SDK in here: this component is dumb, the caller
 * (ImageUploadField) owns the upload. All geometry math lives in lib/crop.ts.
 */

type Mode = "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLES: { mode: Mode; cx: number; cy: number }[] = [
  { mode: "nw", cx: 0, cy: 0 },
  { mode: "n", cx: 0.5, cy: 0 },
  { mode: "ne", cx: 1, cy: 0 },
  { mode: "e", cx: 1, cy: 0.5 },
  { mode: "se", cx: 1, cy: 1 },
  { mode: "s", cx: 0.5, cy: 1 },
  { mode: "sw", cx: 0, cy: 1 },
  { mode: "w", cx: 0, cy: 0.5 },
];

const MIN = 20; // minimum crop size in display px

function clampRect(r: Rect, bounds: { w: number; h: number }): Rect {
  const w = Math.max(MIN, Math.min(r.w, bounds.w));
  const h = Math.max(MIN, Math.min(r.h, bounds.h));
  const x = Math.max(0, Math.min(r.x, bounds.w - w));
  const y = Math.max(0, Math.min(r.y, bounds.h - h));
  return { x, y, w, h };
}

export function ImageCropper({
  src,
  sourceMime,
  onConfirm,
  onCancel,
}: {
  src: string;
  sourceMime: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [baking, setBaking] = useState(false);
  const [error, setError] = useState("");
  const drag = useRef<{ mode: Mode; px: number; py: number; start: Rect } | null>(null);

  // Initialize the crop rect to ~80% centered once the image has measured its box.
  function onImgLoad() {
    const el = imgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    setBox({ w, h });
    setRect({ x: w * 0.1, y: h * 0.1, w: w * 0.8, h: h * 0.8 });
  }

  function startDrag(mode: Mode, e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { mode, px: e.clientX, py: e.clientY, start: { ...rect } };
  }

  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || !box) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    let { x, y, w, h } = d.start;
    if (d.mode === "move") {
      x += dx;
      y += dy;
    } else {
      if (d.mode.includes("w")) {
        x += dx;
        w -= dx;
      }
      if (d.mode.includes("e")) {
        w += dx;
      }
      if (d.mode.includes("n")) {
        y += dy;
        h -= dy;
      }
      if (d.mode.includes("s")) {
        h += dy;
      }
    }
    setRect(clampRect({ x, y, w, h }, box));
  }

  function endDrag() {
    drag.current = null;
  }

  async function confirm() {
    const el = imgRef.current;
    if (!el || !box) return;
    setBaking(true);
    setError("");
    try {
      const source = mapCropToSource(
        rect,
        box,
        { w: el.naturalWidth, h: el.naturalHeight },
      );
      const blob = await bakeCrop(el, source, pickOutputType(sourceMime));
      onConfirm(blob);
    } catch (err) {
      setError((err as Error).message || "Falha ao recortar a imagem.");
      setBaking(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        data-testid="cropper"
        style={{ position: "relative", display: "inline-block", lineHeight: 0, touchAction: "none" }}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local objectURL, no optimization needed */}
        <img
          ref={imgRef}
          src={src}
          alt=""
          onLoad={onImgLoad}
          style={{ display: "block", maxWidth: "100%", height: "auto", userSelect: "none" }}
          draggable={false}
        />
        {box ? (
          <div
            data-testid="crop-rect"
            data-x={Math.round(rect.x)}
            data-y={Math.round(rect.y)}
            data-w={Math.round(rect.w)}
            data-h={Math.round(rect.h)}
            onPointerDown={(e) => startDrag("move", e)}
            style={{
              position: "absolute",
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              border: "2px solid #fff",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              cursor: "move",
              boxSizing: "border-box",
            }}
          >
            {HANDLES.map((hd) => (
              <div
                key={hd.mode}
                data-testid={`handle-${hd.mode}`}
                onPointerDown={(e) => startDrag(hd.mode, e)}
                style={{
                  position: "absolute",
                  left: `calc(${hd.cx * 100}% - 7px)`,
                  top: `calc(${hd.cy * 100}% - 7px)`,
                  width: 14,
                  height: 14,
                  background: "#fff",
                  border: "1px solid #888",
                  borderRadius: 2,
                  cursor: `${hd.mode}-resize`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          data-testid="crop-confirm"
          onClick={confirm}
          disabled={baking || !box}
          style={{
            padding: "6px 10px",
            border: "1px solid #2c7",
            borderRadius: 6,
            background: baking ? "#f0f0f0" : "#eafff3",
            cursor: baking ? "default" : "pointer",
            fontSize: 13,
          }}
        >
          {baking ? "Recortando..." : "Recortar e enviar"}
        </button>
        <button
          type="button"
          data-testid="crop-cancel"
          onClick={onCancel}
          disabled={baking}
          style={{
            padding: "6px 10px",
            border: "1px solid #d0d0d0",
            borderRadius: 6,
            background: "#fff",
            cursor: baking ? "default" : "pointer",
            fontSize: 13,
          }}
        >
          Cancelar
        </button>
      </div>

      {error ? (
        <p style={{ color: "#b00020", fontSize: 12, margin: 0 }}>{error}</p>
      ) : null}
    </div>
  );
}
