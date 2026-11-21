import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { Post } from "@/data/mockPosts";
import HomeClient from "@/components/HomeClient";

// ISR: mantém a página inicial em cache de servidor/CDN por 5 minutos
// e invalida imediatamente via revalidatePath("/") ao publicar/editar/excluir no Admin.
export const revalidate = 300;

async function getPublishedHomePosts(): Promise<Post[]> {
  try {
    const richSelect =
      "id, title, slug, category_slug, subcategory, banca, summary, read_time, featured_image, youtube_video_id, is_published, created_at, updated_at, status, scheduled_at, tags, flashcards_count, questions_count, simulados_count, infographics_count";
    const baseSelect =
      "id, title, slug, category_slug, subcategory, banca, summary, read_time, featured_image, youtube_video_id, is_published, created_at, updated_at";

    let { data, error } = await supabase
      .from("posts")
      .select(richSelect)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error && error.message?.toLowerCase().includes("column")) {
      const fallbackRes = await supabase
        .from("posts")
        .select(baseSelect)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      data = fallbackRes.data as any;
      error = fallbackRes.error;
    }

    if (error || !data) {
      return [];
    }

    const now = new Date();
    const validPosts = (data as any[]).filter((item) => {
      if (item.status === "draft" || item.status === "review") return false;
      if (item.status === "scheduled" && item.scheduled_at && new Date(item.scheduled_at) > now) {
        return false;
      }
      return item.is_published !== false;
    });

    return validPosts.map((item: any) => {
      const parsedTags: string[] = Array.isArray(item.tags)
        ? item.tags
        : typeof item.tags === "string" && item.tags.trim()
        ? item.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        category:
          item.category_slug === "estude-comigo" || item.category_slug === "assista"
            ? "Estude comigo"
            : item.category_slug === "estude"
            ? "Estude"
            : item.category_slug === "aprenda"
            ? "Aprenda"
            : item.category_slug === "informe-se"
            ? "Informe-se"
            : item.category_slug === "rotina"
            ? "Rotina"
            : "Estude",
        subcategory: item.subcategory,
        banca: item.banca,
        summary: item.summary || "",
        content: "",
        publishedAt: new Date(item.created_at || Date.now()).toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        readTime: item.read_time || "6 min de leitura",
        youtubeVideoId: item.youtube_video_id,
        featuredImage:
          item.featured_image ||
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        tags: parsedTags,
        flashcardsCount: item.flashcards_count || 0,
        questionsCount: item.questions_count || 0,
        simuladosCount: item.simulados_count || 0,
        infographicsCount: item.infographics_count || 0,
      };
    });
  } catch (err) {
    console.error("Erro ao carregar posts da Home no servidor:", err);
    return [];
  }
}

export default async function HomePage() {
  const initialPosts = await getPublishedHomePosts();
  return <HomeClient initialPosts={initialPosts} />;
}
