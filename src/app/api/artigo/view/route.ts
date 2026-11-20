import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";

    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
    }

    const { error } = await supabase.rpc("increment_post_view", { target_slug: slug });

    if (error) {
      // Falha silenciosa caso a RPC ainda não exista no ambiente
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
