import { createClient } from "@supabase/supabase-js";
import type { Category, Part } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const server = createClient(url, anon, { auth: { persistSession: false } });

export async function loadCatalog(): Promise<{
  categories: Category[];
  parts: Part[];
}> {
  const [{ data: categories, error: e1 }, { data: parts, error: e2 }] =
    await Promise.all([
      server
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true }),
      server.from("parts").select("*"),
    ]);
  if (e1) throw e1;
  if (e2) throw e2;
  return {
    categories: (categories ?? []) as Category[],
    parts: (parts ?? []) as Part[],
  };
}
