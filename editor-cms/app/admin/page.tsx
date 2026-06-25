import Editor from "./Editor";
import { loadPage } from "../../lib/content";

// Editor is interactive and reads the working-tree page.json at request time.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await loadPage("ilhagrande");
  return <Editor initialData={data} />;
}
