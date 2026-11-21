"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/data/mockPosts";
import { supabase } from "@/lib/supabaseClient";
import InteractiveStudyModal from "@/components/InteractiveStudyModal";
import ArticleTableOfContents from "@/components/ArticleTableOfContents";
import {
  decodeMathEntities,
  hydrateMathInContainer,
  renderMathCardsInHtml,
} from "@/lib/katexHelper";
import {
  cleanAndSanitizeArticleHtml,
  extractStudyDataFromContentHtml,
  getArticleVisibility,
  injectHeadingIds,
} from "@/lib/articleSecurity";
import { validateStudyMetadata } from "@/lib/studyMetadataSchema";
import { 
  Clock, 
  BrainCircuit, 
  HelpCircle, 
  Zap, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  Share2, 
  Bookmark,
  UserCheck,
  Layers,
  Sparkles,
  Tag,
  X,
  Target,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Printer,
  Download
} from "lucide-react";
import YouTubeIcon from "@/components/icons/YouTubeIcon";

interface ArticleClientProps {
  initialPost: Post | null;
  initialFlashcards?: any[];
  slug: string;
}

export default function ArticleClient({ initialPost, initialFlashcards = [], slug }: ArticleClientProps) {
  const [post, setPost] = useState<Post | null>(initialPost);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPost);
  const [dbFlashcards, setDbFlashcards] = useState<any[]>(initialFlashcards);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"flashcards" | "questions" | "simulado" | "infografico">("flashcards");
  
  // Dropdown state for study tools section
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  // Real login status from Supabase Auth
  const [isLoggedInMember, setIsLoggedInMember] = useState(false);

  // Accessibility Font Size State
  const [fontSizeLevel, setFontSizeLevel] = useState<"normal" | "sm" | "lg" | "xl">("normal");

  // Web Speech API Text-to-Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechProgress, setSpeechProgress] = useState<number>(0);

  // Bookmark & Share Feedback State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // HTML sanitizado e memoizado com IDs determinísticos em <h2>/<h3> para o Sumário e KaTeX pré-renderizado nos cards
  const renderedArticleHtml = useMemo(
    () => renderMathCardsInHtml(injectHeadingIds(cleanAndSanitizeArticleHtml(post?.content || ""))),
    [post?.content]
  );

  // Objeto memoizado evita que o React 19 reatribua innerHTML em re-renders não relacionados,
  // preservando as fórmulas KaTeX inline hidratadas no DOM.
  const articleHtmlMarkup = useMemo(
    () => ({ __html: renderedArticleHtml }),
    [renderedArticleHtml]
  );

  // Persiste o último artigo visitado para o botão "Voltar ao Artigo" em /minha-revisao
  useEffect(() => {
    if (typeof window === "undefined" || !post?.slug) return;
    try {
      sessionStorage.setItem(
        "cf_last_article",
        JSON.stringify({
          href: `/artigo/${post.slug}`,
          title: post.title || "Artigo anterior",
        })
      );
    } catch {}
  }, [post?.slug, post?.title]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("cf_saved_articles") || "[]");
      if (Array.isArray(saved)) {
        setIsBookmarked(saved.includes(slug));
      }
    } catch {
      setIsBookmarked(false);
    }

    // Registra 1 visualização real por sessão de navegador
    const viewKey = `cf_viewed_${slug}`;
    try {
      if (!sessionStorage.getItem(viewKey)) {
        sessionStorage.setItem(viewKey, "1");
        fetch("/api/artigo/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        }).catch(() => {});
      }
    } catch {}
  }, [slug]);

  // Clean up SpeechSynthesis when switching articles or unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [slug]);

  // Automatic KaTeX hydration for Math cards & Inline LaTeX formulas in article content
  useEffect(() => {
    if (typeof window === "undefined" || !post?.content) return;
    const containers = [document.getElementById("article-content-body"), document.getElementById("article-focus-content-body")].filter(Boolean) as HTMLElement[];
    if (containers.length === 0) return;
    containers.forEach((container) => {
      hydrateMathInContainer(container);
    });
  }, [post?.content, isFocusMode, fontSizeLevel]);

  // Event delegation segura (substitui onclick inline removido pelo sanitizador XSS)
  useEffect(() => {
    if (typeof window === "undefined" || !post?.content) return;
    const containers = [
      document.getElementById("article-content-body"),
      document.getElementById("article-focus-content-body"),
    ].filter(Boolean) as HTMLElement[];
    if (containers.length === 0) return;

    const handleDelegatedClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const copyLawBtn = target.closest(".btn-copiar-lei") as HTMLButtonElement | null;
      if (copyLawBtn) {
        event.preventDefault();
        const quote = copyLawBtn.closest(".callout-lei")?.querySelector("blockquote");
        const textToCopy = quote?.textContent?.trim();
        if (textToCopy && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copyLawBtn.dataset.originalLabel || copyLawBtn.textContent || "📋 Copiar";
            copyLawBtn.dataset.originalLabel = originalText;
            copyLawBtn.textContent = "✓ Copiado!";
            window.setTimeout(() => {
              copyLawBtn.textContent = originalText;
            }, 2000);
          } catch {
            // Clipboard bloqueado pelo navegador
          }
        }
        return;
      }

      const copyMathBtn = target.closest(".btn-copy-math") as HTMLButtonElement | null;
      if (copyMathBtn) {
        event.preventDefault();
        const block = copyMathBtn.closest(".math-card-block");
        const body = block?.querySelector(".math-card-body");
        const rawLatex =
          body?.getAttribute("data-latex") ||
          block?.getAttribute("data-latex") ||
          body?.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim() ||
          body?.textContent?.trim();
        const latex = rawLatex ? decodeMathEntities(rawLatex) : "";
        if (latex && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(latex);
            const originalText = copyMathBtn.dataset.originalLabel || copyMathBtn.textContent || "📋 Copiar LaTeX";
            copyMathBtn.dataset.originalLabel = originalText;
            copyMathBtn.textContent = "✓ Copiado!";
            window.setTimeout(() => {
              copyMathBtn.textContent = originalText;
            }, 2000);
          } catch {
            // Clipboard bloqueado pelo navegador
          }
        }
        return;
      }

      const mnemonicPill = target.closest(".mnemonico-grid span") as HTMLElement | null;
      if (mnemonicPill) {
        mnemonicPill.classList.toggle("active");
      }
    };

    containers.forEach((container) => container.addEventListener("click", handleDelegatedClick));
    return () => {
      containers.forEach((container) => container.removeEventListener("click", handleDelegatedClick));
    };
  }, [post?.content, isFocusMode]);

  // Web Speech API Refs for stable chunk-by-chunk audio reading
  const speechChunksRef = React.useRef<string[]>([]);
  const speechIndexRef = React.useRef<number>(0);
  const speechRateRef = React.useRef<number>(1.0);
  const currentUtteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  // Helper to get available pt-BR voice
  const getPtVoice = (synth: SpeechSynthesis): SpeechSynthesisVoice | undefined => {
    try {
      const voices = synth.getVoices();
      return (
        voices.find(v => (v.lang === "pt-BR" || v.lang === "pt_BR") && v.localService) ||
        voices.find(v => v.lang === "pt-BR" || v.lang === "pt_BR") ||
        voices.find(v => v.lang.startsWith("pt"))
      );
    } catch (e) {
      return undefined;
    }
  };

  const playSpeechChunk = (index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    const chunks = speechChunksRef.current;

    if (index >= chunks.length) {
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
      setSpeechProgress(100);
      speechIndexRef.current = 0;
      currentUtteranceRef.current = null;
      delete (window as any).__activeSpeechUtterance;
      return;
    }

    speechIndexRef.current = index;
    const textChunk = chunks[index];
    if (!textChunk || !textChunk.trim()) {
      playSpeechChunk(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textChunk.trim());
    utterance.lang = "pt-BR";
    utterance.rate = speechRateRef.current;

    const ptVoice = getPtVoice(synth);
    if (ptVoice) {
      try { utterance.voice = ptVoice; } catch (e) {}
    }

    const progressPct = Math.min(100, Math.max(1, Math.round(((index + 1) / chunks.length) * 100)));

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsAudioPaused(false);
      setSpeechProgress(progressPct);
    };

    utterance.onend = () => {
      const nextIndex = index + 1;
      setSpeechProgress(progressPct);
      setTimeout(() => {
        if (speechChunksRef.current.length > 0) {
          playSpeechChunk(nextIndex);
        }
      }, 30);
    };

    utterance.onerror = (e) => {
      console.warn("Speech Synthesis warning on chunk", index, e);
      if (e.error === "interrupted" || e.error === "canceled") return;
      setTimeout(() => {
        if (speechChunksRef.current.length > 0) {
          playSpeechChunk(index + 1);
        }
      }, 50);
    };

    currentUtteranceRef.current = utterance;
    (window as any).__activeSpeechUtterance = utterance;

    try {
      synth.speak(utterance);
      if (synth.paused) synth.resume();
    } catch (err) {
      console.error("Error invoking synth.speak:", err);
      playSpeechChunk(index + 1);
    }
  };

  // Handler for Audio Player (Play / Pause / Resume)
  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Seu navegador não possui suporte à reprodução de áudio por síntese de voz.");
      return;
    }

    const synth = window.speechSynthesis;

    if (isPlayingAudio) {
      if (isAudioPaused || synth.paused) {
        try { synth.resume(); } catch (e) {}
        setIsAudioPaused(false);
      } else {
        try { synth.pause(); } catch (e) {}
        setIsAudioPaused(true);
      }
      return;
    }

    try {
      synth.cancel();
      if (synth.paused) synth.resume();
    } catch (e) {}

    // Clean article HTML / Text for reading
    const articleContainer = document.getElementById("article-content-body");
    let rawText = "";
    if (articleContainer) {
      const clone = articleContainer.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".btn-copiar-lei, .btn-copy-math, .katex-mathml, button, svg, script, style, .estudo-spoiler summary").forEach(el => el.remove());
      rawText = clone.innerText || clone.textContent || "";
    } else {
      rawText = (post?.summary || "") + ". " + (post?.content || "").replace(/<[^>]*>/g, " ");
    }

    const cleanedText = rawText
      ? rawText
          .replace(/<!--[\s\S]*?-->/g, " ")
          .replace(/\$\$\s*[\s\S]*?\s*\$\$/g, " ")
          .replace(/\$[^\$\n]+?\$/g, " ")
          .replace(/📋\s*Copiar/gi, "")
          .replace(/[\r\n]+/g, ". ")
          .replace(/\s+/g, " ")
          .trim()
      : "";

    const fullTitle = post?.title ? `${post.title}. ` : "";
    const fullText = fullTitle + cleanedText;

    if (!fullText.trim()) {
      alert("Não foi possível extrair o texto do artigo para leitura.");
      return;
    }

    // Split text into readable sentence chunks by punctuation
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const rawMatches = fullText.match(sentenceRegex);
    let chunks: string[] = rawMatches && rawMatches.length > 0
      ? rawMatches.map(c => c.trim()).filter(c => c.length > 2)
      : [fullText];

    if (chunks.length === 0) chunks = [fullText];

    speechChunksRef.current = chunks;
    speechIndexRef.current = 0;
    setSpeechProgress(1);
    setIsPlayingAudio(true);
    setIsAudioPaused(false);

    setTimeout(() => {
      playSpeechChunk(0);
    }, 50);
  };

  const handleStopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      try {
        synth.cancel();
        if (synth.paused) synth.resume();
      } catch (e) {}
    }
    currentUtteranceRef.current = null;
    delete (window as any).__activeSpeechUtterance;
    speechChunksRef.current = [];
    speechIndexRef.current = 0;
    setIsPlayingAudio(false);
    setIsAudioPaused(false);
    setSpeechProgress(0);
  };

  const handleRateChange = (newRate: number) => {
    speechRateRef.current = newRate;
    setSpeechRate(newRate);
    if (isPlayingAudio && typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      try {
        synth.cancel();
        if (synth.paused) synth.resume();
      } catch (e) {}
      const currentIndex = speechIndexRef.current;
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
      setTimeout(() => {
        setIsPlayingAudio(true);
        playSpeechChunk(currentIndex);
      }, 100);
    }
  };

  const handleToggleBookmark = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = JSON.parse(localStorage.getItem("cf_saved_articles") || "[]");
      const list: string[] = Array.isArray(raw) ? raw : [];
      let nextList: string[];
      if (list.includes(slug)) {
        nextList = list.filter((s) => s !== slug);
        setIsBookmarked(false);
        setShareFeedback("Removido dos salvos");
      } else {
        nextList = [...list, slug];
        setIsBookmarked(true);
        setShareFeedback("Artigo salvo!");
      }
      localStorage.setItem("cf_saved_articles", JSON.stringify(nextList));
      window.setTimeout(() => setShareFeedback(null), 2200);
    } catch {
      // Storage indisponível
    }
  };

  const handleShareArticle = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    const shareData = {
      title: post?.title || "Concurseiro Focado",
      text: post?.summary || "Confira este artigo de estudo para concursos!",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback("Link copiado!");
        window.setTimeout(() => setShareFeedback(null), 2200);
      }
    } catch {
      // Usuário cancelou o compartilhamento nativo
    }
  };

  // Handler for PDF Print/Export
  const handlePrintPDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

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

    // Client-side fallback fetch if initialPost was not provided by Server Component
    async function loadArticleFromDb() {
      if (initialPost) return;
      try {
        const { data: dbPost, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .single();

        if (!error && dbPost) {
          if (
            !getArticleVisibility(
              dbPost.content_html,
              dbPost.is_published,
              new Date(),
              dbPost.status,
              dbPost.scheduled_at
            ).isPublic
          ) {
            setPost(null);
            return;
          }

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

          const sanitizedHtml = cleanAndSanitizeArticleHtml(dbPost.content_html || "");
          const cleanText = sanitizedHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

          const hasColumnStudyData =
            dbPost.study_data &&
            typeof dbPost.study_data === "object" &&
            Object.keys(dbPost.study_data).length > 0;
          const rawStudyData = hasColumnStudyData
            ? dbPost.study_data
            : extractStudyDataFromContentHtml(dbPost.content_html || "");
          const validation = rawStudyData ? validateStudyMetadata(rawStudyData) : { success: false, data: undefined };
          const parsedStudyData = (validation.data || rawStudyData) as any;

          const flashcardsArr = (parsedStudyData && Array.isArray(parsedStudyData.flashcards)) ? parsedStudyData.flashcards : [];
          const questionsArr = (parsedStudyData && Array.isArray(parsedStudyData.questions)) ? parsedStudyData.questions : [];
          const simuladosArr = (parsedStudyData && Array.isArray(parsedStudyData.simulados)) ? parsedStudyData.simulados : [];
          const infographicsArr = (parsedStudyData && Array.isArray(parsedStudyData.infographics)) ? parsedStudyData.infographics : [];

          const { data: fcData } = await supabase
            .from("flashcards")
            .select("*")
            .eq("post_id", dbPost.id);

          const existingQuestions = new Set(
            flashcardsArr.map((fc: any) => String(fc.question || "").trim().toLowerCase())
          );
          const uniqueDbFlashcards = (fcData || []).filter(
            (fc: any) => !existingQuestions.has(String(fc.question || "").trim().toLowerCase())
          );
          const combinedFlashcards = [...flashcardsArr, ...uniqueDbFlashcards];
          if (combinedFlashcards.length > 0) {
            setDbFlashcards(combinedFlashcards);
          }

          setPost({
            id: dbPost.id,
            title: dbPost.title,
            slug: dbPost.slug,
            category: (dbPost.category_slug === "estude-comigo" || dbPost.category_slug === "assista")
              ? "Estude comigo"
              : dbPost.category_slug === "estude" ? "Estude"
              : dbPost.category_slug === "aprenda" ? "Aprenda"
              : dbPost.category_slug === "informe-se" ? "Informe-se"
              : dbPost.category_slug === "rotina" ? "Rotina" : "Estude",
            subcategory: dbPost.subcategory,
            banca: dbPost.banca,
            summary: dbPost.summary || "",
            content: sanitizedHtml,
            publishedAt: pubDateStr,
            updatedAt: updDateStr,
            readTime: `${dynamicReadMinutes} min de leitura`,
            youtubeVideoId: dbPost.youtube_video_id,
            featuredImage: dbPost.featured_image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
            tags: extractedTags,
            flashcardsCount: combinedFlashcards.length || dbPost.flashcards_count || 0,
            questionsCount: questionsArr.length || dbPost.questions_count || 0,
            simuladosCount: simuladosArr.length || dbPost.simulados_count || 0,
            infographicsCount: infographicsArr.length || dbPost.infographics_count || 0,
            questions: questionsArr,
            simulados: simuladosArr,
            infographics: infographicsArr
          });
        }
      } catch (e) {
        console.error("Erro ao carregar artigo no cliente:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadArticleFromDb();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [slug, initialPost]);

  const openFlashcards = () => {
    setModalType("flashcards");
    setIsModalOpen(true);
  };

  const openQuestions = () => {
    setModalType("questions");
    setIsModalOpen(true);
  };

  const openSimulado = () => {
    setModalType("simulado");
    setIsModalOpen(true);
  };

  const openInfographic = () => {
    const list = post?.infographics || [];
    
    // Se houver múltiplos infográficos, abre o modal de estudo para o usuário escolher qual deseja ver
    if (list.length > 1) {
      setModalType("infografico");
      setIsModalOpen(true);
      return;
    }

    const targetInfog = list.find((i: any) => i.url || i.codeContent) || list[0];
    if (targetInfog?.url) {
      window.open(targetInfog.url, "_blank");
      return;
    }
    if (targetInfog?.codeContent && targetInfog?.id) {
      window.open(`/api/infograficos/${targetInfog.id}`, "_blank");
      return;
    }
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
      
      {/* Printable Brand Header watermark (only visible on print/PDF) */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit uppercase">BLOG CONCURSEIRO FOCADO</h2>
          <span className="text-xs text-slate-600 font-semibold">www.concurseirofocado.com.br</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Material de Estudo de Alta Performance • Impresso em {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      <div className={`mx-auto space-y-8 ${isFocusMode ? "max-w-3xl focus-mode-active" : "max-w-4xl"}`}>
        
        {/* Top Controls Bar: Back Link & Modo Foco Toggle */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar ao Portal
          </Link>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            {/* Modo Foco Toggle Button (High Visibility Highlight - Light & Dark Modes) */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.04] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer border ${
                isFocusMode
                  ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950 dark:text-slate-950 border-amber-300 dark:border-amber-400 shadow-amber-500/20"
              }`}
              title="Entrar no Modo Foco para leitura imersiva sem distrações"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
              <span className="text-slate-950 dark:text-slate-950 font-black">
                {isFocusMode ? "Sair do Modo Foco" : "Modo Foco"}
              </span>
            </button>

            {isLoggedInMember && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">
                Membro Ativo
              </span>
            )}
          </div>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          
          <div className="flex items-center gap-2 flex-wrap">
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

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Autor: Concurseiro Focado
              </span>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {post.readTime}
              </span>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <span title={`Publicado em ${post.publishedAt}`}>Publicado em {post.publishedAt}</span>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <>
                  <span className="hidden sm:inline" aria-hidden="true">•</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 shadow-xs" title={`Conteúdo revisado e atualizado em ${post.updatedAt}`}>
                    🔄 Atualizado em {post.updatedAt}
                  </span>
                </>
              )}
            </div>

            <div className="no-print flex items-center gap-2 flex-wrap self-start sm:self-auto">
              {/* Font Size Selector (Acessibilidade) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl p-1 border border-slate-200 dark:border-slate-700/80">
                <span className="text-[10px] font-extrabold uppercase px-1 text-slate-400 dark:text-slate-500 hidden sm:inline" title="Acessibilidade: Ajustar Tamanho da Fonte">
                  Fonte:
                </span>
                <button
                  onClick={() => setFontSizeLevel("sm")}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    fontSizeLevel === "sm"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title="Fonte Pequena (14px)"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSizeLevel("normal")}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    fontSizeLevel === "normal"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title="Fonte Normal (16px)"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSizeLevel("lg")}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    fontSizeLevel === "lg"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title="Fonte Grande (18px)"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSizeLevel("xl")}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    fontSizeLevel === "xl"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title="Fonte Extra Grande (20px)"
                >
                  A++
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrintPDF}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                title="Baixar em PDF / Imprimir"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToggleBookmark}
                aria-pressed={isBookmarked}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  isBookmarked
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 hover:text-emerald-500"
                }`}
                title={isBookmarked ? "Remover dos favoritos" : "Salvar artigo nos favoritos"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
              <button
                type="button"
                onClick={handleShareArticle}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                title="Compartilhar artigo"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {shareFeedback && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  ✓ {shareFeedback}
                </span>
              )}
            </div>
          </div>

          {/* AUDIO PLAYER (Text-to-Speech) & PDF DOWNLOAD BAR (Slim & Compact) */}
          <div className="no-print p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-slate-100/90 dark:bg-[#0E1526] text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all duration-300">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                onClick={handleToggleAudio}
                className={`p-2 rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer ${
                  isPlayingAudio && !isAudioPaused
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                    : "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 hover:bg-emerald-700 dark:hover:bg-emerald-400"
                }`}
                title={isPlayingAudio ? (isAudioPaused ? "Continuar Áudio" : "Pausar Áudio") : "Ouvir Artigo em Áudio"}
              >
                {isPlayingAudio && !isAudioPaused ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 truncate text-[11px] sm:text-xs">
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "text-amber-500 animate-pulse" : "text-emerald-600 dark:text-emerald-400"}`} />
                    {isPlayingAudio
                      ? isAudioPaused
                        ? "Leitura Pausada"
                        : "Narrando Artigo em Voz Alta..."
                      : "Ouvir este Artigo em Áudio"}
                  </span>
                  {isPlayingAudio && (
                    <span className="font-mono text-amber-600 dark:text-amber-400 text-[10px] shrink-0">{speechProgress}%</span>
                  )}
                </div>

                {/* Progress Track */}
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-200"
                    style={{ width: `${isPlayingAudio ? speechProgress : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
              {/* Stop Audio Button */}
              {isPlayingAudio && (
                <button
                  onClick={handleStopAudio}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Parar áudio"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Speed Control Selector */}
              <div className="flex items-center bg-white dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      speechRate === rate
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* PDF Print Button */}
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-extrabold text-[11px] sm:text-xs transition-all cursor-pointer shadow-xs"
                title="Baixar ou Imprimir este Artigo em PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Baixar PDF</span>
              </button>
            </div>
          </div>

        </div>

        {/* Featured Image */}
        {post.category !== "Estude comigo" && (
          <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              unoptimized={post.featuredImage.startsWith("data:")}
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* INTERACTIVE STUDY TOOLS SECTION (Dropdown / Collapsible Accordion Layout) */}
        {post.category !== "Estude comigo" && (() => {
          const isEstudeCategory = post.category === "Estude";
          return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100/90 via-slate-50 to-emerald-50/40 dark:bg-gradient-to-b dark:from-slate-900 dark:via-[#0D1322] dark:to-[#0A0E17] text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-xl transition-all duration-300">
              
              {/* DROPDOWN TOGGLE TRIGGER HEADER */}
              <button
                onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                aria-expanded={isToolsExpanded}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer group hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-colors"
                title="Clique para expandir ou recolher as Ferramentas de Estudo"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    <BrainCircuit className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-pulse" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
                        Ferramentas de Estudo deste Artigo
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold hidden sm:inline-block">
                        {isToolsExpanded ? "Aberto" : "Clique para Abrir"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 sm:truncate">
                      {isEstudeCategory
                        ? "Flashcards, Questões, Simulados Inéditos e Infográficos acoplados."
                        : "Mapas mentais, resumos visuais e esquemas acoplados a este artigo."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden md:inline">
                    {isToolsExpanded ? "Ocultar" : "Ver Ferramentas"}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {isToolsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* DROPDOWN EXPANDABLE CONTENT */}
              {isToolsExpanded && (
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="pt-3 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
                    
                    {/* Flashcards Button */}
                    {isEstudeCategory && (
                      <button
                        onClick={openFlashcards}
                        className="sm:flex-initial flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-400 hover:text-slate-950 dark:hover:text-slate-950 border border-amber-500/30 hover:border-amber-400 font-extrabold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xs group/btn cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 group-hover/btn:bg-slate-950/20 flex items-center justify-center shrink-0">
                          <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover/btn:text-slate-950" />
                        </div>
                        <span>Flashcards ({dbFlashcards.length ?? post.flashcardsCount ?? 0})</span>
                      </button>
                    )}

                    {/* Questões Button (Provas Pretéritas) */}
                    {isEstudeCategory && (
                      <button
                        onClick={openQuestions}
                        title="Questões de concursos anteriores"
                        className="sm:flex-initial flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-slate-950 dark:hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-400 font-extrabold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xs group/btn cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 group-hover/btn:bg-slate-950/20 flex items-center justify-center shrink-0">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover/btn:text-slate-950" />
                        </div>
                        <span>Questões ({post.questionsCount || 0})</span>
                      </button>
                    )}

                    {/* Simulado Button (Questões Inéditas) */}
                    {isEstudeCategory && (
                      <button
                        onClick={openSimulado}
                        title="Simulado de questões inéditas baseadas neste artigo"
                        className="sm:flex-initial flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500 text-blue-700 dark:text-blue-400 hover:text-white dark:hover:text-white border border-blue-500/30 hover:border-blue-400 font-extrabold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xs group/btn cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 group-hover/btn:bg-white/20 flex items-center justify-center shrink-0">
                          <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover/btn:text-white" />
                        </div>
                        <span>Simulado ({post.simuladosCount || 0})</span>
                      </button>
                    )}

                    {/* Infográfico Button */}
                    <button
                      onClick={openInfographic}
                      className="sm:flex-initial flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white dark:hover:text-white border border-purple-500/30 hover:border-purple-400 font-extrabold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xs group/btn cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 group-hover/btn:bg-white/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover/btn:text-white" />
                      </div>
                      <span>Infográfico ({post.infographicsCount || 0})</span>
                    </button>

                    {/* Atalho Minha Revisão (SRS & Caderno de Erros) */}
                    <Link
                      href={`/minha-revisao?from=${encodeURIComponent(`/artigo/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                      className={`${isEstudeCategory ? "col-span-2 sm:col-span-1" : ""} sm:flex-initial flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white dark:hover:text-white border border-rose-500/30 hover:border-rose-500 font-extrabold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xs group/btn cursor-pointer`}
                      title="Abrir seu painel de Revisão Espaçada (SRS), Caderno de Erros e Salvos"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 group-hover/btn:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                        <BrainCircuit className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 group-hover/btn:text-white transition-colors" />
                      </div>
                      <span>Minha Revisão</span>
                    </Link>

                  </div>
                </div>
              )}

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

        {/* Sumário Automático (Table of Contents) + Barra de Progresso de Leitura */}
        <ArticleTableOfContents containerId="article-content-body" contentKey={post.slug} />

        {/* Article HTML Body Content */}
        <div
          id="article-content-body"
          className={`prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-4 transition-all duration-200 ${
            fontSizeLevel === "sm" ? "article-font-sm" : fontSizeLevel === "lg" ? "article-font-lg" : fontSizeLevel === "xl" ? "article-font-xl" : ""
          }`}
          dangerouslySetInnerHTML={articleHtmlMarkup}
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
          articleSlug={post.slug}
          customFlashcards={dbFlashcards.map(fc => ({
            id: fc.id,
            question: fc.question,
            answer: fc.answer,
            bancaTip: fc.bancaTip,
            category: fc.category || post.subcategory || "Geral"
          }))}
          customQuestions={post.questions || []}
          customSimulados={post.simulados || []}
          customInfographics={post.infographics || []}
        />

      </div>

      {/* FULL-SCREEN IMMERSIVE FOCUS MODE MODAL */}
      {isFocusMode && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#070A10] text-slate-900 dark:text-white overflow-y-auto min-h-screen p-4 sm:p-8 md:p-12 animate-in fade-in duration-200">
          <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xs rounded-xl p-1 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase px-1.5 text-slate-400 dark:text-slate-500 hidden sm:inline">Fonte:</span>
            <button onClick={() => setFontSizeLevel("sm")} className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${fontSizeLevel === "sm" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`} title="Fonte Pequena">A-</button>
            <button onClick={() => setFontSizeLevel("normal")} className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${fontSizeLevel === "normal" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`} title="Fonte Normal">A</button>
            <button onClick={() => setFontSizeLevel("lg")} className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${fontSizeLevel === "lg" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`} title="Fonte Grande">A+</button>
            <button onClick={() => setFontSizeLevel("xl")} className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${fontSizeLevel === "xl" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`} title="Fonte Extra Grande">A++</button>
          </div>
          
          <button
            onClick={() => setIsFocusMode(false)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 px-2.5 py-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300/50 dark:border-slate-700/50 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer backdrop-blur-xs text-xs font-semibold"
            title="Sair do Modo Foco (ESC)"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium opacity-80">Sair (ESC)</span>
          </button>

          <article className="max-w-3xl mx-auto space-y-8 pt-16 sm:pt-14 pb-8 px-1 sm:px-2">
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

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-medium">Autor: Concurseiro Focado</span>
                <span className="hidden sm:inline" aria-hidden="true">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readTime}
                </span>
                <span className="hidden sm:inline" aria-hidden="true">•</span>
                <span>Publicado em {post.publishedAt}</span>
                {post.updatedAt && post.updatedAt !== post.publishedAt && (
                  <>
                    <span className="hidden sm:inline" aria-hidden="true">•</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      🔄 Atualizado em {post.updatedAt}
                    </span>
                  </>
                )}
              </div>
            </div>

            {post.category !== "Estude comigo" && (
              <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  unoptimized={post.featuredImage.startsWith("data:")}
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div
              id="article-focus-content-body"
              className={`prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 space-y-6 pt-2 font-sans transition-all duration-200 ${
                fontSizeLevel === "sm" ? "article-font-sm" : fontSizeLevel === "lg" ? "article-font-lg" : fontSizeLevel === "xl" ? "article-font-xl" : ""
              }`}
              dangerouslySetInnerHTML={articleHtmlMarkup}
            />

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
