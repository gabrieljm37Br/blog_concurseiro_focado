"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { MOCK_POSTS, Post } from "@/data/mockPosts";
import { supabase } from "@/lib/supabaseClient";
import InteractiveStudyModal from "@/components/InteractiveStudyModal";
import { 
  Clock, 
  BrainCircuit, 
  HelpCircle, 
  Zap, 
  ChevronLeft, 
  ShieldCheck, 
  Share2, 
  Bookmark,
  UserCheck,
  Layers,
  Sparkles,
  Tag,
  X,
  Minimize2
} from "lucide-react";
import YouTubeIcon from "@/components/icons/YouTubeIcon";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const initialMock = MOCK_POSTS.find((p) => p.slug === slug);
  const [post, setPost] = useState<Post | null>(initialMock || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialMock);
  const [dbFlashcards, setDbFlashcards] = useState<any[]>([]);
  const [dbQuestions, setDbQuestions] = useState<any[]>([]);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"flashcards" | "questions" | "infografico">("flashcards");
  
  // Real login status from Supabase Auth
  const [isLoggedInMember, setIsLoggedInMember] = useState(false);

  // Keyboard listener to close Focus Mode with ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    let subscription: any = null;
    try {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) setIsLoggedInMember(true);
      }).catch((e) => console.warn("Auth getSession warning:", e));

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedInMember(!!session);
      });
      subscription = data?.subscription;
    } catch (e) {
      console.warn("Supabase auth not initialized:", e);
    }

    // Fetch Article from Supabase if available
    async function loadArticleFromDb() {
      try {
        const { data: dbPost, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .single();

        if (!error && dbPost) {
          // Extract tags from dbPost.tags OR <!-- TAGS: ... --> comment OR fallbacks
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
          const calculatedReadTime = `${dynamicReadMinutes} min de leitura`;

          setPost({
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
            publishedAt: new Date(dbPost.created_at || Date.now()).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long', year: 'numeric' }),
            readTime: calculatedReadTime,
            youtubeVideoId: dbPost.youtube_video_id,
            featuredImage: dbPost.featured_image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
            tags: extractedTags,
            flashcardsCount: dbPost.flashcards_count || 0,
            questionsCount: dbPost.questions_count || 0,
            infographicsCount: dbPost.infographics_count || 0
          });

          // Load flashcards for this post from Supabase
          const { data: fcData } = await supabase
            .from("flashcards")
            .select("*")
            .eq("post_id", dbPost.id);

          if (fcData && fcData.length > 0) {
            setDbFlashcards(fcData);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar artigo do DB:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadArticleFromDb();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [slug]);

  const openFlashcards = () => {
    setModalType("flashcards");
    setIsModalOpen(true);
  };

  const openQuestions = () => {
    setModalType("questions");
    setIsModalOpen(true);
  };

  const openInfographic = () => {
    setModalType("infografico");
    setIsModalOpen(true);
  };

  if (isLoading && !post) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">Carregando Artigo...</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Buscando conteúdo atualizado e ferramentas de estudo no portal.</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">Artigo não encontrado</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">O artigo solicitado não existe ou pode ter sido removido.</p>
        <Link href="/" className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all">
          Voltar ao Portal
        </Link>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 py-8 px-4 sm:px-6 lg:px-8 ${isFocusMode ? "bg-amber-50/30 dark:bg-[#070A10]" : ""}`}>
      
      {/* Schema.org Structured Data for Google Discover & Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "image": [post.featuredImage],
            "description": post.summary,
            "author": {
              "@type": "Organization",
              "name": "Concurseiro Focado",
              "url": "https://concurseirofocado.com.br"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Concurseiro Focado"
            }
          })
        }}
      />

      <div className={`mx-auto space-y-8 ${isFocusMode ? "max-w-3xl focus-mode-active" : "max-w-4xl"}`}>
        
        {/* Top Controls Bar: Back Link & Modo Foco Toggle */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar ao Portal
          </Link>

          <div className="flex items-center gap-3">
            {/* Modo Foco Toggle Button */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isFocusMode
                  ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950/60"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isFocusMode ? "fill-slate-950" : "text-amber-500"}`} />
              <span>{isFocusMode ? "Sair do Modo Foco" : "Ativar Modo Foco"}</span>
            </button>

            {/* Simulated Member Status Toggle for Demo */}
            <button
              onClick={() => setIsLoggedInMember(!isLoggedInMember)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline"
            >
              {isLoggedInMember ? "Membro Logado (Sem Ads)" : "Simular Membro Logado"}
            </button>
          </div>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {post.category}
            </span>
            {post.subcategory && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                • {post.subcategory}
              </span>
            )}
            {post.banca && (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                • Banca {post.banca}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Autor: Concurseiro Focado
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {post.readTime}
              </span>
              <span>•</span>
              <span>{post.publishedAt}</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Featured Image (Não exibida na categoria 'Estude comigo') */}
        {post.category !== "Estude comigo" && (
          <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* INTERACTIVE STUDY MODALS BAR (Não exibida na categoria 'Estude comigo') */}
        {post.category !== "Estude comigo" && (() => {
          const isEstudeCategory = post.category === "Estude";
          return (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0F172A] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-sm text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                  <BrainCircuit className="w-4 h-4 text-amber-400" /> Ferramentas de Estudo Deste Artigo
                </h3>
                <p className="text-xs text-slate-300">
                  {isEstudeCategory
                    ? "Pratique evocação rápida com flashcards, questões e infográficos acoplados."
                    : "Visualize o resumo visual e mapa mental em infográfico."}
                </p>
              </div>

              <div className="flex items-center gap-2 lg:gap-2.5 shrink-0 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {/* Flashcards & Questões: Visíveis APENAS na categoria 'Estude' */}
                {isEstudeCategory && (
                  <>
                    <button
                      onClick={openFlashcards}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Layers className="w-4 h-4 shrink-0" />
                      <span>Flashcards ({dbFlashcards.length ?? post.flashcardsCount ?? 0})</span>
                    </button>

                    <button
                      onClick={openQuestions}
                      className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      <span>Questões ({post.questionsCount || 0})</span>
                    </button>
                  </>
                )}

                {/* Infográfico: Visível nas demais categorias (exceto 'Estude comigo') */}
                <button
                  onClick={openInfographic}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Infográfico ({post.infographicsCount || 0})</span>
                </button>
              </div>
            </div>
          );
        })()}



        {/* YouTube Embed if available */}
        {post.youtubeVideoId && (
          <div className="my-6 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
              <YouTubeIcon className="w-4 h-4 text-red-500" /> Vídeo Explicativo do Canal:
            </h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${post.youtubeVideoId}`}
                title={post.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Article HTML Body Content */}
        <div 
          className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ 
            __html: post.content
              .replace(/^\s*(?:<!--[\s\S]*?-->\s*)?<div[^>]*border-b[^>]*>\s*<h1[^>]*>[\s\S]*?<\/h1>\s*<\/div>/gi, "")
              .replace(/^\s*(?:<!--[\s\S]*?-->\s*)?<h1[^>]*>[\s\S]*?<\/h1>/gi, "")
              .replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2 class="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2"$1>$2</h2>')
              .replace(/<h2[^>]*>\s*<img[^>]*src="data:image[^"]*"[^>]*\/?>\s*/gi, '<h2 class="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white mt-8 mb-4">')
              .replace(/style="[^"]*max-width:[^"]*"/gi, "")
          }}
        />

        {/* Article Tags / Palavras-chave Relacionadas */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-500" /> Assuntos e Palavras-chave Relacionadas:
            </h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/?q=${encodeURIComponent(tag)}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span className="text-emerald-500 font-black">#</span>
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Study Modal */}
        <InteractiveStudyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={modalType}
          articleTitle={post.title}
          customFlashcards={dbFlashcards.map(fc => ({
            id: fc.id,
            question: fc.question,
            answer: fc.answer,
            category: fc.category || post.subcategory || "Geral"
          }))}
          customQuestions={post.questions || []}
          customInfographics={post.infographics || []}
        />

      </div>

      {/* FULL-SCREEN IMMERSIVE FOCUS MODE MODAL */}
      {isFocusMode && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#070A10] text-slate-900 dark:text-white overflow-y-auto min-h-screen p-4 sm:p-8 md:p-12 animate-in fade-in duration-200">
          
          {/* Floating Minimal Exit 'X' Button */}
          <button
            onClick={() => setIsFocusMode(false)}
            className="fixed top-5 right-5 sm:top-8 sm:right-8 z-50 p-3 sm:p-3.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-950 hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-slate-950 transition-all shadow-2xl hover:scale-110 flex items-center gap-2 group cursor-pointer border border-slate-700/50 dark:border-slate-300/50 backdrop-blur-md"
            title="Sair do Modo Foco (ESC)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-90 stroke-[2.5]" />
            <span className="text-xs font-black tracking-wide pr-1 hidden md:inline">Sair (ESC)</span>
          </button>

          {/* Clean Article Reader Body */}
          <article className="max-w-3xl mx-auto space-y-8 py-6 px-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {post.category}
                </span>
                {post.subcategory && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    • {post.subcategory}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit text-slate-900 dark:text-white leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-medium">Autor: Concurseiro Focado</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readTime}
                </span>
                <span>•</span>
                <span>{post.publishedAt}</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.category !== "Estude comigo" && (
              <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Article Content Text */}
            <div
              className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 space-y-6 pt-2 font-sans"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Bottom Exit Bar */}
            <div className="pt-12 text-center border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsFocusMode(false)}
                className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" /> Sair do Modo Foco (Ou pressione ESC)
              </button>
            </div>
          </article>

        </div>
      )}

    </div>
  );
}
