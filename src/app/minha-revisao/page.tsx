"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Bookmark,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Check,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import MathRenderer from "@/components/MathRenderer";
import {
  clearQuestionFromErrorNotebook,
  getDueFlashcards,
  getErrorNotebookQuestions,
  getSavedArticleSlugs,
  recordFlashcardReview,
  type QuestionAttemptRecord,
  type SrsFlashcardRecord,
} from "@/lib/studyProgress";

interface SavedArticlePreview {
  slug: string;
  title: string;
  subcategory?: string | null;
  read_time?: string | null;
}

export default function MinhaRevisaoPage() {
  const [dueCards, setDueCards] = useState<SrsFlashcardRecord[]>([]);
  const [errorQuestions, setErrorQuestions] = useState<QuestionAttemptRecord[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedArticlePreview[]>([]);
  const [activeTab, setActiveTab] = useState<"srs" | "erros" | "salvos">("srs");

  // Mini player SRS inline para revisar flashcards vencidos hoje
  const [reviewIdx, setReviewIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const refreshLocalData = () => {
    setDueCards(getDueFlashcards());
    setErrorQuestions(getErrorNotebookQuestions());
  };

  useEffect(() => {
    refreshLocalData();

    const slugs = getSavedArticleSlugs();
    if (slugs.length > 0) {
      supabase
        .from("posts")
        .select("slug, title, subcategory, read_time")
        .in("slug", slugs)
        .eq("is_published", true)
        .then(({ data }) => {
          if (data) setSavedArticles(data);
        });
    }
  }, []);

  const handleReviewAnswer = (result: "correct" | "wrong") => {
    const card = dueCards[reviewIdx];
    if (!card) return;
    recordFlashcardReview({
      articleSlug: card.articleSlug,
      articleTitle: card.articleTitle,
      cardId: card.cardId,
      question: card.question,
      answer: card.answer,
      bancaTip: card.bancaTip,
      category: card.category,
      result,
    });
    setIsFlipped(false);
    const updatedDue = getDueFlashcards();
    setDueCards(updatedDue);
    setReviewIdx((prev) => (updatedDue.length === 0 ? 0 : prev % updatedDue.length));
  };

  const handleResolveErrorQuestion = (key: string) => {
    clearQuestionFromErrorNotebook(key);
    setErrorQuestions(getErrorNotebookQuestions());
  };

  const currentCard = dueCards[reviewIdx] || null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Portal
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-emerald-500" />
            Minha Revisão & Caderno de Erros
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Repetição espaçada automática (SRS), questões erradas para revisão dirigida e seus artigos favoritos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("srs")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "srs"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            SRS Hoje ({dueCards.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("erros")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "erros"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Caderno de Erros ({errorQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("salvos")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "salvos"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Salvos ({savedArticles.length})
          </button>
        </div>
      </div>

      {/* TAB 1: REVISÃO ESPAÇADA (SRS) */}
      {activeTab === "srs" && (
        currentCard ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Card {reviewIdx + 1} de {dueCards.length} pendente(s) para revisão hoje
              </span>
              <Link
                href={`/artigo/${currentCard.articleSlug}`}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Ver artigo: {currentCard.articleTitle} ↗
              </Link>
            </div>

            <div
              onClick={() => setIsFlipped((prev) => !prev)}
              className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-amber-500/30 shadow-2xl min-h-[280px] flex flex-col justify-between text-center cursor-pointer select-none transition-all hover:border-amber-400"
            >
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                <span className="text-amber-400">
                  {isFlipped ? "✨ Verso / Gabarito" : "🧠 Frente / Pergunta"}
                </span>
                <span className="text-slate-400">
                  {currentCard.category || "Revisão Espaçada"} • Acertos seguidos: {currentCard.repetitions}
                </span>
              </div>

              <div className="my-auto py-6 space-y-3">
                {!isFlipped ? (
                  <h2 className="text-lg sm:text-2xl font-extrabold font-outfit leading-relaxed">
                    <MathRenderer content={currentCard.question} />
                  </h2>
                ) : (
                  <>
                    <div className="text-base sm:text-xl font-bold text-emerald-200 leading-relaxed">
                      <MathRenderer content={currentCard.answer} />
                    </div>
                    {currentCard.bancaTip && (
                      <div className="inline-block px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold">
                        💡 <strong>Dica da Banca:</strong> {currentCard.bancaTip}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isFlipped ? (
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" /> Clique no cartão para revelar a resposta
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReviewAnswer("wrong");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Revisar Novamente (Hoje)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReviewAnswer("correct");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Dominei (Avançar Curva SRS)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-extrabold font-outfit text-slate-900 dark:text-white">
              Revisão Espaçada em Dia!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Pratique os Flashcards nos artigos do portal — todos os cards revisados serão agendados automaticamente aqui na curva 1d → 3d → 7d → 15d → 30d.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              Explorar Artigos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )
      )}

      {/* TAB 2: CADERNO DE ERROS */}
      {activeTab === "erros" && (
        errorQuestions.length > 0 ? (
          <div className="space-y-3">
            {errorQuestions.map((q) => (
              <div
                key={q.key}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold uppercase text-[10px]">
                      {q.mode === "simulado" ? "Simulado Inédito" : q.banca || "Questão de Prova"}
                    </span>
                    <span className="text-slate-400 font-semibold">
                      Erros acumulados: {q.wrongCount}
                    </span>
                  </div>
                  <Link
                    href={`/artigo/${q.articleSlug}`}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Reestudar: {q.articleTitle} ↗
                  </Link>
                </div>

                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {q.statement}
                </p>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleResolveErrorQuestion(q.key)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como Dominada
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-extrabold font-outfit text-slate-900 dark:text-white">
              Caderno de Erros Zerado
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Sempre que você errar uma questão ou simulado em qualquer artigo, ela será catalogada aqui para revisão direcionada.
            </p>
          </div>
        )
      )}

      {/* TAB 3: ARTIGOS SALVOS (FAVORITOS) */}
      {activeTab === "salvos" && (
        savedArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedArticles.map((art) => (
              <Link
                key={art.slug}
                href={`/artigo/${art.slug}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all space-y-2 shadow-xs group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {art.subcategory || "Artigo Salvo"}
                  </span>
                  <span>{art.read_time || "Leitura rápida"}</span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {art.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-3.5 h-3.5" /> Continuar estudando →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-extrabold font-outfit text-slate-900 dark:text-white">
              Nenhum Artigo Salvo Ainda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Clique no ícone de favorito no topo de qualquer artigo para montar sua trilha pessoal de revisão.
            </p>
            <div className="pt-1 inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Seus favoritos ficam salvos localmente no navegador
            </div>
          </div>
        )
      )}
    </div>
  );
}
