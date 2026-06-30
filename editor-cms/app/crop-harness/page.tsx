import { notFound } from "next/navigation";
import { CropHarnessClient } from "./CropHarnessClient";

/**
 * Dev-only crop harness (recorte real, D-crop). Mounts ImageUploadField with a STUB
 * uploader so Playwright can drive pick -> adjust rectangle -> confirm headless, without
 * the admin auth gate and without touching the real Vercel Blob store. The stub measures
 * the baked blob's dimensions so the test can assert the upload is the CROPPED region, not
 * the original. Never served in production (mirrors app/fidelity-harness).
 */
export const dynamic = "force-dynamic";

export default function CropHarness() {
  if (process.env.NODE_ENV === "production") notFound();
  return <CropHarnessClient />;
}
