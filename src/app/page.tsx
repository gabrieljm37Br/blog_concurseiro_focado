"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MOCK_POSTS, MOCK_APPS, Post } from "@/data/mockPosts";
import { supabase } from "@/lib/supabaseClient";
import PostCard from "@/components/PostCard";
import { 
  Target, 
  BrainCircuit, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  ShoppingBag,
  CheckCircle,
  HelpCircle,
  Flame,
  Award,
  Tag,
  X
} from "lucide-react";
import YouTubeIcon from "@/components/icons/YouTubeIcon";

function HomeContent() {
  const searchParams = useSearchParams();
  const tagQuery = searchParams ? (searchParams.get("q") || searchParams.get("tag") || "") : "";

  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);

  const categories = ["Todos", "Estude", "Aprenda", "Estude comigo", "Informe-se"];

  useEffect(() => {
    async function loadSupabasePosts() {
      setLoadingPosts(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const now = new Date();
          const validPosts = data.filter((item: any) => {
            let status = "published";
            let schedAt: string | null = null;
            if (item.content_html) {
              const statusMatch = item.content_html.match(/<!-- STATUS: ([\s\S]*?) -->/i);
              if (statusMatch && statusMatch[1]) status = statusMatch[1].trim();
              const schedMatch = item.content_html.match(/<!-- SCHEDULED_AT: ([\s\S]*?) -->/i);
              if (schedMatch && schedMatch[1]) schedAt = schedMatch[1].trim();
            }

            if (status === "draft" || status === "review") return false;
            if (status === "scheduled" && schedAt) {
              if (new Date(schedAt) > now) return false;
            }
            return item.is_published || status === "published" || status === "scheduled";
          });

          const mappedPosts: Post[] = validPosts.map((item: any) => {
            const cleanText = (item.content_html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
            const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
            const dynamicMinutes = Math.max(1, Math.ceil(wordCount / 200));

            return {
              id: item.id,
              title: item.title,
              slug: item.slug,
              category: (item.category_slug === "estude-comigo" || item.category_slug === "assista") 
                ? "Estude comigo" 
                : item.category_slug === "estude" ? "Estude"
                : item.category_slug === "aprenda" ? "Aprenda"
                : item.category_slug === "informe-se" ? "Informe-se" : "Estude",
              subcategory: item.subcategory,
              banca: item.banca,
              summary: item.summary || "",
              content: item.content_html || "",
              publishedAt: new Date(item.created_at || Date.now()).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long', year: 'numeric' }),
              readTime: `${dynamicMinutes} min de leitura`,
              youtubeVideoId: item.youtube_video_id,
              featuredImage: item.featured_image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
              tags: item.tags || [],
              flashcardsCount: 12,
              questionsCount: 5,
              infographicsCount: 2
            };
          });

          setPosts(mappedPosts);
        }
      } catch (err) {
        console.error("Erro ao carregar posts do Supabase:", err);
      } finally {
        setLoadingPosts(false);
      }
    }

    loadSupabasePosts();
  }, []);

  // Filter posts by category AND active tag/search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "Todos" || post.category === selectedCategory;
    if (!matchesCategory) return false;

    if (tagQuery) {
      const q = tagQuery.toLowerCase().trim();
      const matchesTitle = post.title.toLowerCase().includes(q);
      const matchesSubcategory = post.subcategory?.toLowerCase().includes(q);
      const matchesBanca = post.banca?.toLowerCase().includes(q);
      const matchesTag = post.tags?.some(t => t.toLowerCase().includes(q));
      return matchesTitle || matchesSubcategory || matchesBanca || matchesTag;
    }
    return true;
  });

  return (
    <div className="space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#090D16] via-[#0D1322] to-[#0F172A] text-white pt-16 pb-24 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        
        {/* Glow Background Lights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute -top-12 right-12 w-80 h-80 bg-teal-500/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Sutil YouTube Notification Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs font-semibold text-emerald-400 backdrop-blur-md shadow-md hover:border-emerald-500/60 transition-colors cursor-pointer">
            <YouTubeIcon className="w-4 h-4 text-red-500 shrink-0" />
            <span>Hub Oficial do Canal <strong>Concurseiro Focado</strong></span>
          </div>

          {/* Reinforced H1 Title with Glow Highlights */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-outfit tracking-tight leading-[1.15] text-white">
            Estudo{" "}
            <span className="text-[#10B981] drop-shadow-[0_0_25px_rgba(16,185,129,0.8)]">
              Ativo & Prático
            </span>{" "}
            para <br className="hidden sm:inline" />
            <span className="text-[#10B981] drop-shadow-[0_0_25px_rgba(16,185,129,0.8)]">
              Aprovação
            </span>{" "}
            <span className="text-white">em Concursos</span>
          </h1>

          {/* Supportive Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Mais do que 'assistir a alguém estudar'. Aqui você tem acesso ao meu processo de aprendizagem em prática: conteúdos didáticos públicos, técnicas comprovadas, flashcards interativos, simulados acoplados aos artigos e APPs de gestão de estudo.
          </p>

          {/* Clear CTA Hierarchy */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            
            {/* Primary CTA */}
            <Link
              href="#artigos"
              className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2.5"
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>Explorar Artigos</span>
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/loja"
              className="px-7 py-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 font-bold text-sm sm:text-base transition-all hover:scale-[1.02] flex items-center gap-2.5 backdrop-blur-md"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Conhecer Nossos APPs</span>
            </Link>

          </div>

          {/* Neon Glow Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left max-w-5xl mx-auto">
            
            {/* Card 1 */}
            <div className="relative p-6 rounded-2xl bg-[#0B101D] border border-slate-800/80 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] hover:border-emerald-500/50 hover:shadow-[0_20px_45px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center gap-4 group overflow-hidden">
              <div className="absolute -bottom-6 left-6 w-24 h-12 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none" />
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#060911] border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-transform relative z-10">
                <ShieldCheck className="w-9 h-9 text-[#10B981] drop-shadow-[0_0_12px_#10B981]" />
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit tracking-tight">
                  Membros Sem Ads
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  Cadastre-se gratuitamente para navegar sem anúncios AdSense.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative p-6 rounded-2xl bg-[#0B101D] border border-slate-800/80 shadow-[0_15px_30px_-10px_rgba(245,158,11,0.3)] hover:border-amber-500/50 hover:shadow-[0_20px_45px_-10px_rgba(245,158,11,0.5)] transition-all duration-300 flex items-center gap-4 group overflow-hidden">
              <div className="absolute -bottom-6 left-6 w-24 h-12 bg-amber-500/20 blur-2xl rounded-full pointer-events-none" />

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#060911] border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform relative z-10">
                <Zap className="w-9 h-9 text-[#F59E0B] drop-shadow-[0_0_12px_#F59E0B]" />
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit tracking-tight">
                  Modo Foco
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  Ambiente de leitura limpo sem distrações visuais nas sessões de estudo.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative p-6 rounded-2xl bg-[#0B101D] border border-slate-800/80 shadow-[0_15px_30px_-10px_rgba(59,130,246,0.3)] hover:border-blue-500/50 hover:shadow-[0_20px_45px_-10px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center gap-4 group overflow-hidden">
              <div className="absolute -bottom-6 left-6 w-24 h-12 bg-blue-500/20 blur-2xl rounded-full pointer-events-none" />

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#060911] border border-blue-500/40 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform relative z-10">
                <BrainCircuit className="w-9 h-9 text-[#3B82F6] drop-shadow-[0_0_12px_#3B82F6]" />
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit tracking-tight">
                  Modais de Treino
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  Flashcards e questões acoplados direto nas páginas dos artigos.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* RECENT ARTICLES SECTION */}
      <section id="artigos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Conteúdo Prático & Didático
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
              {tagQuery ? `Artigos Filtrados por Tag` : `Últimas Publicações do Blog`}
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE TAG FILTER NOTIFICATION BANNER */}
        {tagQuery && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Exibindo conteúdos sobre a tag: <strong className="underline decoration-emerald-500">#{tagQuery}</strong> ({filteredPosts.length} artigos encontrados)</span>
            </div>
            <Link
              href="/"
              onClick={() => setSelectedCategory("Todos")}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Limpar Filtro
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        {loadingPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-3xl bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse">
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-50 dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {tagQuery 
                ? `Nenhum artigo encontrado para a tag "${tagQuery}".` 
                : `Nenhum artigo publicado no momento.`}
            </p>
            {tagQuery && (
              <Link
                href="/"
                className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-all"
              >
                Ver Todos os Artigos do Blog
              </Link>
            )}
          </div>
        )}

      </section>

      {/* PROPRIETARY APPS HIGHLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-8 sm:p-12 border border-slate-800 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <ShoppingBag className="w-3.5 h-3.5" /> Ecossistema Concurseiro Focado
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit leading-tight">
              Gerencie seus estudos com nossos APPs Próprios
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Ferramentas de gestão, ciclo de estudos, repetição espaçada e simulados desenvolvidas especialmente para otimizar sua rotina de preparação.
            </p>
            
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/loja"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                Ir para a Loja de APPs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Carregando portal...</div>}>
      <HomeContent />
    </Suspense>
  );
}
