import { loadCatalog } from "@/lib/data";
import Builder from "@/components/Builder";
import type { Discipline } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string }>;
}) {
  const { categories, parts } = await loadCatalog();
  const sp = await searchParams;
  const initial: Discipline =
    sp.discipline === "downhill" ? "downhill" : "enduro";
  return <Builder categories={categories} parts={parts} initialDiscipline={initial} />;
}
