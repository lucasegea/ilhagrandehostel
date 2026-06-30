/**
 * Crop geometry contract (recorte real, D-crop). The pure, IO-free core: display->source
 * mapping, the raster-croppable predicate, and the output-type picker. The DOM pieces
 * (canvas bake, drag UI, upload wiring, fail-clear) are exercised browser-side in
 * tests/crop-harness.mjs, because canvas.toBlob and pointer events do not exist in node.
 * Run: npx tsx tests/crop.mjs
 */

const { mapCropToSource, isRasterCroppable, pickOutputType } = await import("../lib/crop.ts");

const checks = [];
const ok = (name, cond) => { checks.push([name, !!cond]); };
const eqRect = (a, b) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

// --- AC-T1.1: known scale factor maps exactly ---
// displayed 400x300, natural 2000x1500 => 5x. rect {100,75,200,150} => {500,375,1000,750}.
const m1 = mapCropToSource(
  { x: 100, y: 75, w: 200, h: 150 },
  { w: 400, h: 300 },
  { w: 2000, h: 1500 },
);
ok("AC-T1.1 5x scale maps {100,75,200,150} -> {500,375,1000,750}", eqRect(m1, { x: 500, y: 375, w: 1000, h: 750 }));

// identity scale (displayed == natural) is a pass-through
const mId = mapCropToSource({ x: 10, y: 20, w: 30, h: 40 }, { w: 800, h: 600 }, { w: 800, h: 600 });
ok("identity scale is pass-through", eqRect(mId, { x: 10, y: 20, w: 30, h: 40 }));

// --- AC-T1.2: overflow / negative inputs clamp to a valid in-bounds rect ---
// rect x negative and w beyond the right edge -> clamp to source bounds, full width.
const m2 = mapCropToSource(
  { x: -50, y: 0, w: 500, h: 400 },
  { w: 400, h: 300 },
  { w: 2000, h: 1500 },
);
ok("AC-T1.2 overflowing rect clamps inside [0,natural]", m2.x >= 0 && m2.y >= 0 && m2.x + m2.w <= 2000 && m2.y + m2.h <= 1500);
ok("AC-T1.2 clamped rect stays non-empty (w/h >= 1)", m2.w >= 1 && m2.h >= 1);
ok("AC-T1.2 full-overflow rect resolves to the whole source", eqRect(m2, { x: 0, y: 0, w: 2000, h: 1500 }));

// a degenerate zero-size pick floors to 1px without escaping the source bounds
const m3 = mapCropToSource({ x: 400, y: 300, w: 0, h: 0 }, { w: 400, h: 300 }, { w: 800, h: 600 });
ok("degenerate zero-size pick floors to w/h>=1 in bounds", m3.w >= 1 && m3.h >= 1 && m3.x + m3.w <= 800 && m3.y + m3.h <= 600);

// inverted rect (negative w via dragging past the origin) normalizes
const m4 = mapCropToSource({ x: 300, y: 200, w: -100, h: -50 }, { w: 400, h: 300 }, { w: 400, h: 300 });
ok("inverted rect normalizes to a positive in-bounds rect", m4.w >= 1 && m4.h >= 1 && m4.x >= 0 && m4.y >= 0);

// --- AC-T1.3: raster predicate + output type ---
ok("jpeg is raster-croppable", isRasterCroppable("image/jpeg"));
ok("png is raster-croppable", isRasterCroppable("image/png"));
ok("webp is raster-croppable", isRasterCroppable("image/webp"));
ok("avif is raster-croppable", isRasterCroppable("image/avif"));
ok("svg bypasses the cropper (not raster)", !isRasterCroppable("image/svg+xml"));
ok("gif bypasses the cropper (not raster)", !isRasterCroppable("image/gif"));

// IMAGE_CONTENT_TYPES the minted token accepts; every output type must be inside it.
const { IMAGE_CONTENT_TYPES } = await import("../lib/blob-upload.ts");
const allowed = new Set(IMAGE_CONTENT_TYPES);
for (const src of ["image/jpeg", "image/png", "image/webp", "image/avif"]) {
  const out = pickOutputType(src);
  ok(`AC-T1.3 ${src} bakes to a token-allowed type (${out.type})`, allowed.has(out.type));
}
ok("png preserves png", pickOutputType("image/png").type === "image/png");
ok("webp preserves webp", pickOutputType("image/webp").type === "image/webp");
ok("jpeg bakes to jpeg @0.9 (no size balloon)", pickOutputType("image/jpeg").type === "image/jpeg" && pickOutputType("image/jpeg").quality === 0.9);
ok("avif bakes to jpeg (broad support, bounded size)", pickOutputType("image/avif").type === "image/jpeg");

let pass = true;
for (const [name, good] of checks) {
  console.log(`${good ? "PASS" : "FAIL"}  ${name}`);
  if (!good) pass = false;
}
console.log(`${checks.filter((c) => c[1]).length}/${checks.length} checks passed`);
console.log(pass ? "CROP GEOMETRY PASS" : "CROP GEOMETRY FAIL");
process.exit(pass ? 0 : 1);
