import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new NextResponse("ID do infográfico não informado", { status: 400 });
    }

    // Busca os posts cadastrados no Supabase
    const { data: posts, error } = await supabase
      .from("posts")
      .select("content_html");

    if (error || !posts) {
      return new NextResponse("Erro ao buscar infográfico no banco", { status: 404 });
    }

    let targetInfographic: any = null;

    // Varre os posts procurando pelo id do infográfico dentro do JSON b64
    for (const post of posts) {
      if (!post.content_html) continue;
      const match = post.content_html.match(/<!-- STUDY_DATA_JSON_B64: (.*?) -->/);
      if (match && match[1]) {
        try {
          const decoded = JSON.parse(decodeURIComponent(match[1]));
          if (Array.isArray(decoded.infographics)) {
            const found = decoded.infographics.find(
              (info: any) => String(info.id) === String(id)
            );
            if (found) {
              targetInfographic = found;
              break;
            }
          }
        } catch (err) {
          console.error("Erro ao decodificar STUDY_DATA_JSON_B64:", err);
        }
      }
    }

    if (targetInfographic && targetInfographic.codeContent) {
      return new NextResponse(targetInfographic.codeContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return new NextResponse("Conteúdo do infográfico não encontrado", { status: 404 });
  } catch (err) {
    console.error("Erro na rota de infográfico dinâmico:", err);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
