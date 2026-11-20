import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { extractStudyDataFromContentHtml, getArticleVisibility } from "@/lib/articleSecurity";

/**
 * Cabeçalho CSP em modo sandbox estrito (SEM `allow-same-origin`).
 * Isola o documento HTML do infográfico em uma origem opaca (`null`), impedindo
 * acesso a cookies, localStorage, sessão Supabase ou APIs do domínio principal.
 */
const INFOGRAPHIC_SANDBOX_CSP = [
  "sandbox allow-scripts",
  "default-src 'none'",
  "script-src 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
  "img-src data: https: blob:",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
      return new NextResponse("ID do infográfico inválido ou não informado", { status: 400 });
    }

    // 1. Caminho rápido O(1): consulta direta na tabela dedicada `post_infographics` (Fase 3)
    const { data: dedicatedInfo, error: dedicatedError } = await supabase
      .from("post_infographics")
      .select("id, code_content")
      .eq("id", id)
      .maybeSingle();

    if (!dedicatedError && dedicatedInfo?.code_content) {
      return new NextResponse(dedicatedInfo.code_content, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": INFOGRAPHIC_SANDBOX_CSP,
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      });
    }

    // 2. Fallback retrocompatível para artigos legados com infográfico embutido em `content_html`
    const escapedId = id.replace(/[%_\\]/g, "\\$&");
    const { data: posts, error } = await supabase
      .from("posts")
      .select("content_html, is_published")
      .eq("is_published", true)
      .ilike("content_html", `%${escapedId}%`);

    if (error || !posts) {
      return new NextResponse("Erro ao buscar infográfico no banco", { status: 404 });
    }

    let targetInfographic: { id?: string | number; codeContent?: string } | null = null;

    for (const post of posts) {
      if (!post.content_html) continue;

      // Não expõe infográficos pertencentes a rascunhos, revisões ou agendados futuros
      const visibility = getArticleVisibility(post.content_html, post.is_published);
      if (!visibility.isPublic) continue;

      const decoded = extractStudyDataFromContentHtml(post.content_html) as {
        infographics?: Array<{ id?: string | number; codeContent?: string }>;
      } | null;

      if (decoded && Array.isArray(decoded.infographics)) {
        const found = decoded.infographics.find((info) => String(info.id) === String(id));
        if (found && found.codeContent) {
          targetInfographic = found;
          break;
        }
      }
    }

    if (targetInfographic && targetInfographic.codeContent) {
      return new NextResponse(targetInfographic.codeContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": INFOGRAPHIC_SANDBOX_CSP,
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      });
    }

    return new NextResponse("Conteúdo do infográfico não encontrado", { status: 404 });
  } catch (err) {
    console.error("Erro na rota de infográfico dinâmico:", err);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
