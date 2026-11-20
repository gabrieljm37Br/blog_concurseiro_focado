import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/adminAuth";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ovpyjsjvowhhyxvwbedh.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cHlqc2p2b3doaHl4dndiZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1Njc0MjUsImV4cCI6MjA5ODE0MzQyNX0.lWNbTOAO0-YhhceT36jxO6TOwoBzPc8IAh0L7PzWmZA";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) {
      return NextResponse.json({ error: "Token de autenticação ausente." }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser(token);

    if (userError || !userData?.user || !isAdminUser(userData.user)) {
      return NextResponse.json({ error: "Acesso negado: requer privilégios de administrador." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";

    const revalidated: string[] = ["/", "/sitemap.xml"];
    revalidatePath("/");
    revalidatePath("/sitemap.xml");

    if (slug && /^[a-z0-9-]+$/i.test(slug)) {
      revalidatePath(`/artigo/${slug}`);
      revalidated.push(`/artigo/${slug}`);
    }

    return NextResponse.json({ ok: true, revalidated });
  } catch (err) {
    console.error("Erro ao revalidar rotas:", err);
    return NextResponse.json({ error: "Erro interno ao revalidar cache." }, { status: 500 });
  }
}
