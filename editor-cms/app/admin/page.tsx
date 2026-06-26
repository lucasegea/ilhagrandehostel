import Editor from "./Editor";
import { loadPage } from "../../lib/content";
import { resolveSite } from "../../lib/sites";

// Editor is interactive and reads the working-tree page.json at request time.
export const dynamic = "force-dynamic";

/**
 * Multi-site admin (D-CALY-5). `?site=` selects which site to edit; absent -> the
 * hostel. A present-but-unknown site is rejected fail-clear (we never silently load
 * another site's content). The resolved site flows into loadPage AND the Editor (so
 * publish writes back to the SAME site).
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { site?: string };
}) {
  const site = resolveSite(searchParams.site);
  if (!site) {
    return (
      <main style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
        <h1>Site desconhecido</h1>
        <p>
          O site <code>{String(searchParams.site)}</code> não existe. Sites válidos:{" "}
          <code>ilhagrande</code>, <code>calytour</code>.
        </p>
      </main>
    );
  }
  const data = await loadPage(site);
  return <Editor site={site} initialData={data} />;
}
