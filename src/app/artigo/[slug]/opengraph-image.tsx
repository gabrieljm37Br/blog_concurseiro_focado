import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabaseClient";
import { getArticleVisibility } from "@/lib/articleSecurity";

export const alt = "Concurseiro Focado — Estudo Ativo para Concursos";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = "Estudo Ativo & Ferramentas para Concursos";
  let category = "ESTUDE";
  let subcategory = "Concursos Públicos";
  let banca = "";
  let readTime = "Leitura Estratégica";

  try {
    const { data: post } = await supabase
      .from("posts")
      .select("title, category_slug, subcategory, banca, read_time, content_html, is_published, status, scheduled_at")
      .eq("slug", slug)
      .maybeSingle();

    if (
      post &&
      getArticleVisibility(
        post.content_html,
        post.is_published,
        new Date(),
        (post as any).status,
        (post as any).scheduled_at
      ).isPublic
    ) {
      title = post.title || title;
      category = String(post.category_slug || "estude").toUpperCase().replace("-", " ");
      subcategory = post.subcategory || subcategory;
      banca = post.banca ? `Banca ${post.banca}` : "";
      readTime = post.read_time || readTime;
    }
  } catch {
    // Usa fallback institucional seguro
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #070a12 0%, #0f172a 55%, #064e3b 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top Row: Brand & Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#10b981",
                color: "#020617",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 900,
              }}
            >
              CF
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "0.04em" }}>
                CONCURSEIRO FOCADO
              </span>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                concurseirofocado.com.br
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <span
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.18)",
                border: "1px solid rgba(16, 185, 129, 0.45)",
                color: "#34d399",
                fontSize: "16px",
                fontWeight: 800,
              }}
            >
              {category}
            </span>
            {banca && (
              <span
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px",
                  background: "rgba(245, 158, 11, 0.18)",
                  border: "1px solid rgba(245, 158, 11, 0.45)",
                  color: "#fbbf24",
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                {banca}
              </span>
            )}
          </div>
        </div>

        {/* Center Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "1040px" }}>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#34d399",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {subcategory}
          </span>
          <div
            style={{
              fontSize: title.length > 75 ? "46px" : "56px",
              fontWeight: 900,
              lineHeight: 1.15,
              color: "#ffffff",
            }}
          >
            {title.length > 130 ? `${title.slice(0, 127)}...` : title}
          </div>
        </div>

        {/* Bottom Footer Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(148, 163, 184, 0.25)",
            paddingTop: "24px",
            fontSize: "18px",
            color: "#cbd5e1",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <span>Flashcards Ativos</span>
            <span>•</span>
            <span>Questões Comentadas</span>
            <span>•</span>
            <span>Simulados Inéditos</span>
          </div>
          <span style={{ color: "#fbbf24", fontWeight: 700 }}>{readTime}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
