import React, { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Post } from "@/data/mockPosts";
import ArticleClient from "./ArticleClient";
import { validateStudyMetadata } from "@/lib/studyMetadataSchema";
import {
  cleanAndSanitizeArticleHtml,
  extractStudyDataFromContentHtml,
  getArticleVisibility,
} from "@/lib/articleSecurity";

interface Props {
  params: Promise<{ slug: string }>;
}

const getPostBySlug = cache(async (slug: string) => {
  const { data: dbPost, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !dbPost) {
    return null;
  }

  return dbPost;
});

function extractTagsFromPost(dbPost: Record<string, any>): string[] {
  let extractedTags: string[] = [];

  if (Array.isArray(dbPost.tags) && dbPost.tags.length > 0) {
    extractedTags = dbPost.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
  } else if (typeof dbPost.tags === "string" && dbPost.tags.trim().length > 0) {
    extractedTags = dbPost.tags
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
  } else if (dbPost.content_html) {
    const match = String(dbPost.content_html).match(/<!--\s*TAGS:\s*([\s\S]*?)\s*-->/i);
    if (match && match[1]) {
      extractedTags = match[1]
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
  }

  if (extractedTags.length === 0) {
    if (dbPost.subcategory) extractedTags.push(dbPost.subcategory);
    if (dbPost.banca) extractedTags.push(`Banca ${dbPost.banca}`);
    if (dbPost.category_slug) extractedTags.push(dbPost.category_slug);
  }

  return Array.from(new Set(extractedTags));
}

function mapCategorySlug(categorySlug: string | null | undefined): Post["category"] {
  if (categorySlug === "estude-comigo" || categorySlug === "assista") return "Estude comigo";
  if (categorySlug === "estude") return "Estude";
  if (categorySlug === "aprenda") return "Aprenda";
  if (categorySlug === "informe-se") return "Informe-se";
  if (categorySlug === "rotina") return "Rotina";
  return "Estude";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://concurseirofocado.com.br";
  const fallbackOgImage =
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80";

  try {
    const dbPost = await getPostBySlug(slug);

    if (
      !dbPost ||
      !getArticleVisibility(
        dbPost.content_html,
        dbPost.is_published,
        new Date(),
        dbPost.status,
        dbPost.scheduled_at
      ).isPublic
    ) {
      return {
        title: "Artigo não encontrado | Concurseiro Focado",
        description: "O artigo solicitado não existe ou ainda não foi publicado.",
        robots: { index: false, follow: false },
      };
    }

    const title = `${dbPost.title} | Concurseiro Focado`;
    const description =
      dbPost.summary || `Leia o artigo completo sobre ${dbPost.title} no portal Concurseiro Focado.`;
    const rawImage = typeof dbPost.featured_image === "string" ? dbPost.featured_image.trim() : "";
    const resolvedImage = rawImage.startsWith("/") ? `${baseUrl}${rawImage}` : rawImage;
    // Data URIs não são aceitas em og:image / twitter:image; usa OpenGraph dinâmico PNG (next/og)
    const dynamicOgImage = `${baseUrl}/artigo/${slug}/opengraph-image`;
    const ogImage = resolvedImage && !resolvedImage.startsWith("data:") ? resolvedImage : dynamicOgImage;
    const canonicalUrl = `${baseUrl}/artigo/${slug}`;

    const tags = extractTagsFromPost(dbPost);
    if (dbPost.subcategory && !tags.includes(dbPost.subcategory)) tags.push(dbPost.subcategory);
    if (dbPost.banca && !tags.includes(`Banca ${dbPost.banca}`)) tags.push(`Banca ${dbPost.banca}`);

    return {
      title,
      description,
      keywords: tags,
      authors: [{ name: "Concurseiro Focado", url: baseUrl }],
      creator: "Concurseiro Focado",
      publisher: "Concurseiro Focado",
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: dbPost.title,
        description,
        url: canonicalUrl,
        siteName: "Concurseiro Focado",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: dbPost.title,
          },
        ],
        locale: "pt_BR",
        type: "article",
        publishedTime: dbPost.created_at,
        modifiedTime: dbPost.updated_at || dbPost.created_at,
        tags,
      },
      twitter: {
        card: "summary_large_image",
        title: dbPost.title,
        description,
        images: [ogImage],
        creator: "@concurseirofocado",
      },
    };
  } catch (error) {
    console.error("Erro ao gerar metadados de SEO:", error);
    return {
      title: "Artigo | Concurseiro Focado",
      description: "Artigos e materiais didáticos para concursos públicos.",
    };
  }
}

export default async function ArticlePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://concurseirofocado.com.br";
  const fallbackImage =
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80";

  let dbPost: Record<string, any> | null = null;
  let dbFetchFailed = false;

  try {
    dbPost = await getPostBySlug(slug);
  } catch (e) {
    console.error("Erro no Server Component do Artigo:", e);
    dbFetchFailed = true;
  }

  // Bloqueia rascunhos, artigos em revisão, agendados futuros ou inexistentes com HTTP 404 real
  if (
    !dbFetchFailed &&
    (!dbPost ||
      !getArticleVisibility(
        dbPost.content_html,
        dbPost.is_published,
        new Date(),
        dbPost.status,
        dbPost.scheduled_at
      ).isPublic)
  ) {
    notFound();
  }

  let initialPost: Post | null = null;
  let fcData: any[] = [];

  if (dbPost) {
    const extractedTags = extractTagsFromPost(dbPost);
    const sanitizedHtml = cleanAndSanitizeArticleHtml(dbPost.content_html || "");
    const cleanText = sanitizedHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    const dynamicReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const pubDateStr = new Date(dbPost.created_at || Date.now()).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    let updDateStr: string | undefined = undefined;

    if (dbPost.updated_at) {
      const createdMs = new Date(dbPost.created_at || 0).getTime();
      const updatedMs = new Date(dbPost.updated_at).getTime();
      if (updatedMs - createdMs > 60000) {
        updDateStr = new Date(dbPost.updated_at).toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }

    const hasColumnStudyData =
      dbPost.study_data &&
      typeof dbPost.study_data === "object" &&
      Object.keys(dbPost.study_data).length > 0;
    const rawStudyData = hasColumnStudyData
      ? dbPost.study_data
      : extractStudyDataFromContentHtml(dbPost.content_html || "");
    const validation = rawStudyData ? validateStudyMetadata(rawStudyData) : { success: false, data: undefined };
    const parsedStudyData = validation.data || (rawStudyData as any);

    const flashcardsArr =
      parsedStudyData && Array.isArray(parsedStudyData.flashcards) && parsedStudyData.flashcards.length > 0
        ? parsedStudyData.flashcards
        : [];
    const questionsArr =
      parsedStudyData && Array.isArray(parsedStudyData.questions) ? parsedStudyData.questions : [];
    const simuladosArr =
      parsedStudyData && Array.isArray(parsedStudyData.simulados) ? parsedStudyData.simulados : [];
    const infographicsArr =
      parsedStudyData && Array.isArray(parsedStudyData.infographics) ? parsedStudyData.infographics : [];

    try {
      const { data: flashcards } = await supabase
        .from("flashcards")
        .select("*")
        .eq("post_id", dbPost.id);

      if (flashcards && flashcards.length > 0) {
        // Evita duplicação caso o mesmo flashcard exista tanto no JSON quanto na tabela flashcards
        const existingQuestions = new Set(
          flashcardsArr.map((fc: any) => String(fc.question || "").trim().toLowerCase())
        );
        const uniqueDbFlashcards = flashcards.filter(
          (fc: any) => !existingQuestions.has(String(fc.question || "").trim().toLowerCase())
        );
        fcData = [...flashcardsArr, ...uniqueDbFlashcards];
      } else {
        fcData = flashcardsArr;
      }
    } catch {
      fcData = flashcardsArr;
    }

    initialPost = {
      id: dbPost.id,
      title: dbPost.title,
      slug: dbPost.slug,
      category: mapCategorySlug(dbPost.category_slug),
      subcategory: dbPost.subcategory,
      banca: dbPost.banca,
      summary: dbPost.summary || "",
      content: sanitizedHtml,
      publishedAt: pubDateStr,
      updatedAt: updDateStr,
      readTime: `${dynamicReadMinutes} min de leitura`,
      youtubeVideoId: dbPost.youtube_video_id,
      featuredImage: dbPost.featured_image || fallbackImage,
      tags: extractedTags,
      flashcardsCount: fcData.length || dbPost.flashcards_count || 0,
      questionsCount: questionsArr.length || dbPost.questions_count || 0,
      simuladosCount: simuladosArr.length || dbPost.simulados_count || 0,
      infographicsCount: infographicsArr.length || dbPost.infographics_count || 0,
      questions: questionsArr,
      simulados: simuladosArr,
      infographics: infographicsArr,
    };
  }

  const rawFeaturedImage =
    typeof dbPost?.featured_image === "string" ? dbPost.featured_image.trim() : "";
  const resolvedFeaturedImage = rawFeaturedImage.startsWith("/")
    ? `${baseUrl}${rawFeaturedImage}`
    : rawFeaturedImage;
  const schemaImage =
    resolvedFeaturedImage && !resolvedFeaturedImage.startsWith("data:")
      ? resolvedFeaturedImage
      : `${baseUrl}/artigo/${slug}/opengraph-image`;

  const publishedIso = dbPost?.created_at ? new Date(dbPost.created_at).toISOString() : undefined;
  const modifiedIso = dbPost?.updated_at
    ? new Date(dbPost.updated_at).toISOString()
    : publishedIso;

  // Schema.org Structured Data (JSON-LD) em conformidade com ISO 8601
  const jsonLd = initialPost
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: initialPost.title,
        description: initialPost.summary,
        image: [schemaImage],
        ...(publishedIso ? { datePublished: publishedIso } : {}),
        ...(modifiedIso ? { dateModified: modifiedIso } : {}),
        author: {
          "@type": "Organization",
          name: "Concurseiro Focado",
          url: baseUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "Concurseiro Focado",
          url: baseUrl,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/icons/icon-192.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/artigo/${slug}`,
        },
        keywords: initialPost.tags ? initialPost.tags.join(", ") : initialPost.subcategory,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ArticleClient initialPost={initialPost} initialFlashcards={fcData} slug={slug} />
    </>
  );
}
