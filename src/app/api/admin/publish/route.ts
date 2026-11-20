import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/adminAuth";
import { cleanAndSanitizeArticleHtml } from "@/lib/articleSecurity";
import { runSemanticLinter } from "@/lib/semanticLinter";
import { validateStudyMetadata } from "@/lib/studyMetadataSchema";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ovpyjsjvowhhyxvwbedh.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cHlqc2p2b3doaHl4dndiZWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1Njc0MjUsImV4cCI6MjA5ODE0MzQyNX0.lWNbTOAO0-YhhceT36jxO6TOwoBzPc8IAh0L7PzWmZA";

const ALLOWED_CATEGORIES = new Set(["estude", "aprenda", "estude-comigo", "informe-se", "rotina"]);
const ALLOWED_STATUS = new Set(["published", "draft", "review", "scheduled"]);

/**
 * Endpoint autenticado de publicação editorial automatizada (REST / Pipeline IA).
 *
 * Autenticação suportada:
 * 1. `Authorization: Bearer <Supabase Admin JWT>` (sessão admin real com app_metadata.role = 'admin')
 * 2. `x-publish-api-key: <BLOG_PUBLISH_API_KEY>` (requer `BLOG_PUBLISH_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` no servidor)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    const apiKeyHeader = request.headers.get("x-publish-api-key")?.trim() || "";
    const configuredApiKey = process.env.BLOG_PUBLISH_API_KEY?.trim() || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

    let dbClient: SupabaseClient<any, any, any> | null = null;

    if (configuredApiKey && serviceRoleKey && apiKeyHeader && apiKeyHeader === configuredApiKey) {
      dbClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } else if (bearerToken) {
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${bearerToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData, error: userError } = await authClient.auth.getUser(bearerToken);
      if (userError || !userData?.user || !isAdminUser(userData.user)) {
        return NextResponse.json(
          { error: "Acesso negado: requer usuário administrador autenticado." },
          { status: 403 }
        );
      }
      dbClient = authClient;
    } else {
      return NextResponse.json(
        { error: "Credenciais ausentes. Envie Authorization: Bearer <JWT> ou x-publish-api-key." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload JSON inválido." }, { status: 400 });
    }

    const title = String(body.title || "").trim();
    const slug = String(body.slug || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    const categorySlug = ALLOWED_CATEGORIES.has(String(body.category_slug || "estude"))
      ? String(body.category_slug)
      : "estude";
    const status = ALLOWED_STATUS.has(String(body.status || "published"))
      ? String(body.status)
      : "published";
    const scheduledAt =
      status === "scheduled" && typeof body.scheduled_at === "string" && body.scheduled_at.trim()
        ? body.scheduled_at.trim()
        : null;
    const summary = String(body.summary || "").trim();
    const rawHtml = String(body.content_html || "");
    const featuredImage = typeof body.featured_image === "string" ? body.featured_image.trim() : "";

    const tagsArray: string[] = Array.isArray(body.tags)
      ? body.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
      : typeof body.tags === "string"
      ? body.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];

    const studyValidation = body.study_data
      ? validateStudyMetadata(body.study_data)
      : { success: true, data: { flashcards: [], questions: [], simulados: [], infographics: [] } };
    const cleanStudyData = studyValidation.data || {
      flashcards: [],
      questions: [],
      simulados: [],
      infographics: [],
    };

    // Linter Semântico Pré-Publicação
    const lintReport = runSemanticLinter({
      title,
      slug,
      summary,
      content_html: rawHtml,
      featured_image: featuredImage,
      tags: tagsArray,
      study_data: cleanStudyData,
    });

    if (!lintReport.isValid) {
      return NextResponse.json(
        {
          error: "Artigo reprovado pelo Linter Semântico Pré-Publicação.",
          lint: lintReport,
        },
        { status: 422 }
      );
    }

    // Sanitiza HTML editorial e calcula tempo de leitura limpo
    const sanitizedBodyHtml = cleanAndSanitizeArticleHtml(rawHtml);
    const plainText = sanitizedBodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min de leitura`;

    // Anexa comentários estruturais para retrocompatibilidade com leitores legados
    let finalContentHtml = sanitizedBodyHtml;
    if (tagsArray.length > 0) {
      finalContentHtml += `\n<!-- TAGS: ${tagsArray.join(", ")} -->`;
    }
    finalContentHtml += `\n<!-- STATUS: ${status} -->`;
    if (scheduledAt) {
      finalContentHtml += `\n<!-- SCHEDULED_AT: ${scheduledAt} -->`;
    }
    finalContentHtml += `\n<!-- STUDY_DATA_JSON_B64: ${encodeURIComponent(JSON.stringify(cleanStudyData))} -->`;

    const isPublished =
      status === "published" ||
      (status === "scheduled" && Boolean(scheduledAt) && new Date(scheduledAt!) <= new Date());

    const flashcardsCount = cleanStudyData.flashcards?.length || 0;
    const questionsCount = cleanStudyData.questions?.length || 0;
    const simuladosCount = cleanStudyData.simulados?.length || 0;
    const infographicsCount = cleanStudyData.infographics?.length || 0;

    const fullPayload: Record<string, any> = {
      title,
      slug,
      category_slug: categorySlug,
      subcategory: typeof body.subcategory === "string" && body.subcategory.trim() ? body.subcategory.trim() : null,
      banca: typeof body.banca === "string" && body.banca.trim() ? body.banca.trim() : null,
      summary,
      content_html: finalContentHtml,
      read_time: readTime,
      featured_image: featuredImage || null,
      youtube_video_id:
        typeof body.youtube_video_id === "string" && body.youtube_video_id.trim()
          ? body.youtube_video_id.trim()
          : null,
      is_published: isPublished,
      admin_notes: typeof body.admin_notes === "string" ? body.admin_notes : null,
      status,
      scheduled_at: scheduledAt,
      tags: tagsArray,
      study_data: cleanStudyData,
      flashcards_count: flashcardsCount,
      questions_count: questionsCount,
      simulados_count: simuladosCount,
      infographics_count: infographicsCount,
      updated_at: new Date().toISOString(),
    };

    const clientAny = dbClient as any;
    let { data: savedPost, error: upsertError } = await clientAny
      .from("posts")
      .upsert(fullPayload, { onConflict: "slug" })
      .select("id, slug, title, is_published")
      .single();

    // Fallback automático caso as novas colunas da Fase 3 ainda não tenham sido migradas no banco
    if (upsertError && upsertError.message?.toLowerCase().includes("column")) {
      const legacyPayload = { ...fullPayload };
      delete legacyPayload.status;
      delete legacyPayload.scheduled_at;
      delete legacyPayload.tags;
      delete legacyPayload.study_data;
      delete legacyPayload.flashcards_count;
      delete legacyPayload.questions_count;
      delete legacyPayload.simulados_count;
      delete legacyPayload.infographics_count;

      const retryRes = await clientAny
        .from("posts")
        .upsert(legacyPayload, { onConflict: "slug" })
        .select("id, slug, title, is_published")
        .single();
      savedPost = retryRes.data;
      upsertError = retryRes.error;
    }

    if (upsertError || !savedPost) {
      return NextResponse.json(
        { error: upsertError?.message || "Falha ao gravar artigo no Supabase." },
        { status: 500 }
      );
    }

    // Sincroniza infográficos na tabela dedicada `post_infographics` (se já existir no banco)
    if (cleanStudyData.infographics && cleanStudyData.infographics.length > 0) {
      const infographicRows = cleanStudyData.infographics.map((info) => ({
        id: info.codeContent ? String(info.id) : `${savedPost.id}_${info.id}`,
        post_id: savedPost.id,
        title: info.title,
        subtitle: info.subtitle || "",
        summary: info.summary || "",
        type: info.type || "resumo_visual",
        url: info.url || null,
        code_content: info.codeContent || null,
        metadata: {
          points: info.points || [],
          imageUrl: info.imageUrl,
          hotspots: info.hotspots,
          splitSlider: info.splitSlider,
        },
        updated_at: new Date().toISOString(),
      }));

      await clientAny
        .from("post_infographics")
        .upsert(infographicRows, { onConflict: "id" })
        .then(() => {})
        .catch(() => {});
    }

    // Garante cadastro da subcategoria
    if (fullPayload.subcategory) {
      await clientAny
        .from("subcategories")
        .upsert(
          { name: fullPayload.subcategory, category_slug: categorySlug },
          { onConflict: "name", ignoreDuplicates: true }
        )
        .then(() => {})
        .catch(() => {});
    }

    // Revalidação sob demanda das rotas afetadas
    revalidatePath("/");
    revalidatePath(`/artigo/${slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      ok: true,
      post: savedPost,
      read_time: readTime,
      counts: {
        flashcards: flashcardsCount,
        questions: questionsCount,
        simulados: simuladosCount,
        infographics: infographicsCount,
      },
      lint: lintReport,
    });
  } catch (err) {
    console.error("Erro na API /api/admin/publish:", err);
    return NextResponse.json({ error: "Erro interno no servidor de publicação." }, { status: 500 });
  }
}
