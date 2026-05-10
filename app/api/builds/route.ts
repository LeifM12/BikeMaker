import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const body = await req.json();
  const { name, discipline, selections } = body ?? {};
  if (!name || !discipline || !selections) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("builds")
    .insert({ name, discipline, selections })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
