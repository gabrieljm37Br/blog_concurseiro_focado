import React from "react";
import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import { Post } from "@/data/mockPosts";
import ArticleClient from "./ArticleClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://concurseirofocado.com.br";

  try {
    const { data: dbPost } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!dbPost) {
      return {
        title: "Artigo não encontrado | Concurseiro Focado",
        description: "O artigo solicitado não existe ou foi removido.",
      };
    }

    const title = `${dbPost.title} | Concurseiro Focado`;
    const description = dbPost.summary || `Leia o artigo completo sobre ${dbPost.title} no portal Concurseiro Focado.`;
    const image = dbPost.featured_image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80";
    const canonicalUrl = `${baseUrl}/artigo/${slug}`;

    let tags: string[] = [];
    if (Array.isArray(dbPost.tags)) {
      tags = dbPost.tags;
    } else if (typeof dbPost.tags === "string" && dbPost.tags.trim()) {
      tags = dbPost.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    }
    if (dbPost.subcategory) tags.push(dbPost.subcategory);
    if (dbPost.banca) tags.push(`Banca ${dbPost.banca}`);

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
            url: image,
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
        images: [image],
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

  let initialPost: Post | null = null;
  let fcData: any[] = [];

  try {
    const { data: dbPost } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (dbPost) {
      let extractedTags: string[] = [];
      if (Array.isArray(dbPost.tags) && dbPost.tags.length > 0) {
        extractedTags = dbPost.tags;
      } else if (typeof dbPost.tags === "string" && (dbPost.tags as string).trim().length > 0) {
        extractedTags = (dbPost.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean);
      } else if (dbPost.content_html) {
        const match = dbPost.content_html.match(/<!-- TAGS: ([\s\S]*?) -->/i);
        if (match && match[1]) {
          extractedTags = match[1].split(",").map((t: string) => t.trim()).filter(Boolean);
        }
      }

      if (extractedTags.length === 0) {
        if (dbPost.subcategory) extractedTags.push(dbPost.subcategory);
        if (dbPost.banca) extractedTags.push(`Banca ${dbPost.banca}`);
        if (dbPost.category_slug) extractedTags.push(dbPost.category_slug);
      }

      const cleanText = (dbPost.content_html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
      const dynamicReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

      const pubDateStr = new Date(dbPost.created_at || Date.now()).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long', year: 'numeric' });
      let updDateStr: string | undefined = undefined;

      if (dbPost.updated_at) {
        const createdMs = new Date(dbPost.created_at || 0).getTime();
        const updatedMs = new Date(dbPost.updated_at).getTime();
        if (updatedMs - createdMs > 60000) {
          updDateStr = new Date(dbPost.updated_at).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long', year: 'numeric' });
        }
      }

      initialPost = {
        id: dbPost.id,
        title: dbPost.title,
        slug: dbPost.slug,
        category: (dbPost.category_slug === "estude-comigo" || dbPost.category_slug === "assista") 
          ? "Estude comigo" 
          : dbPost.category_slug === "estude" ? "Estude"
          : dbPost.category_slug === "aprenda" ? "Aprenda"
          : dbPost.category_slug === "informe-se" ? "Informe-se" : "Estude",
        subcategory: dbPost.subcategory,
        banca: dbPost.banca,
        summary: dbPost.summary || "",
        content: dbPost.content_html || "",
        publishedAt: pubDateStr,
        updatedAt: updDateStr,
        readTime: `${dynamicReadMinutes} min de leitura`,
        youtubeVideoId: dbPost.youtube_video_id,
        featuredImage: dbPost.featured_image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        tags: extractedTags,
        flashcardsCount: dbPost.flashcards_count || 0,
        questionsCount: dbPost.questions_count || 0,
        infographicsCount: dbPost.infographics_count || 0
      };

      const { data: flashcards } = await supabase
        .from("flashcards")
        .select("*")
        .eq("post_id", dbPost.id);

      if (flashcards) {
        fcData = flashcards;
      }
    }
  } catch (e) {
    console.error("Erro no Server Component do Artigo:", e);
  }

  // Schema.org Structured Data (JSON-LD) for Google Discover and Rich Snippets
  const jsonLd = initialPost ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": initialPost.title,
    "description": initialPost.summary,
    "image": [initialPost.featuredImage],
    "datePublished": initialPost.publishedAt,
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Concurseiro Focado",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Concurseiro Focado",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/globe.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/artigo/${slug}`
    },
    "keywords": initialPost.tags ? initialPost.tags.join(", ") : initialPost.subcategory
  } : null;

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
