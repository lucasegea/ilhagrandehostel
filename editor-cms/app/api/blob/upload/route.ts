import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthorizedEditor } from "../../../../lib/auth-guard";
import { IMAGE_CONTENT_TYPES, requireBlobToken } from "../../../../lib/blob-upload";

/**
 * Blob upload token route (M6, D-106). Client-direct uploads (app/admin/ImageUploadField)
 * call here for a short-lived, image-scoped token before PUTting the bytes straight to
 * Vercel Blob, and Vercel calls back here when the upload completes. Two events, one
 * handler, via @vercel/blob/client's handleUpload:
 *
 *   onBeforeGenerateToken — runs with the editor's session. This is the THIRD allowlist
 *     enforcement point (after the signIn callback and the publish guard): a sessionless
 *     or non-allowlisted caller gets NO token minted (we throw), which the catch turns
 *     into the same 403 shape /api/publish returns. It runs ONLY for the token-mint
 *     event, so the sessionless completion callback below is never blocked by it.
 *   onUploadCompleted — a server-to-server callback from Vercel with NO session, so it
 *     is deliberately NOT gated. The token minted above already scoped the upload, and
 *     the URL reaches page.json via the editor's onChange + publish, not from here.
 *
 * Fail-clear throughout: any auth ambiguity or missing config is a refusal, never a
 * silently minted token. The store-token check is scoped to the token-mint event and
 * runs BEFORE handleUpload — handleUpload resolves the store token before it calls
 * onBeforeGenerateToken, so checking it here is what lets a missing token surface the
 * readable message instead of the SDK's generic one (and keeps the completion callback,
 * which needs no store token from us, untouched).
 *
 * Imports note: @vercel/blob/client is loaded here (a route handler), never into the
 * shared puck.config / RSC render graph. handleUpload is server-side; only `upload` is
 * the browser API, and that lives behind the "use client" ImageUploadField boundary.
 */
export async function POST(req: Request): Promise<Response> {
  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ ok: false, error: "corpo inválido" }, { status: 400 });
  }

  try {
    if (body.type === "blob.generate-client-token") {
      requireBlobToken(process.env.BLOB_READ_WRITE_TOKEN);
    }

    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!(await isAuthorizedEditor())) {
          throw new Error("não autorizado");
        }
        return {
          allowedContentTypes: [...IMAGE_CONTENT_TYPES],
          // Keep a random suffix so re-uploading a same-named file never clobbers an
          // image already referenced by a published page.json.
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Server-to-server callback (no session); intentionally a no-op. Nothing to
        // persist here — the published page.json is the source of truth for which URLs
        // are live.
      },
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = (e as Error).message;
    const status =
      message === "não autorizado"
        ? 403
        : message.includes("BLOB_READ_WRITE_TOKEN")
          ? 500
          : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
