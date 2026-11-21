"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  FileEdit,
  Clock,
  Target,
  Layers,
  BrainCircuit,
  Sparkles,
  Flame,
  BarChart3,
  Award,
} from "lucide-react";
import { extractStudyDataFromContentHtml } from "@/lib/articleSecurity";

export interface AdminStatsPost {
  id: string;
  title: string;
  category_slug: string;
  content_html?: string;
  read_time?: string;
  is_published?: boolean;
  study_data?: any;
  flashcards_count?: number;
  questions_count?: number;
  simulados_count?: number;
  infographics_count?: number;
  views_count?: number;
}

interface AdminStatsTabProps {
  posts: AdminStatsPost[];
}

export default function AdminStatsTab({ posts }: AdminStatsTabProps) {
  const postMetrics = posts.map((postItem) => {
    const hasPrecomputedCounts =
      typeof postItem.flashcards_count === "number" ||
      typeof postItem.questions_count === "number" ||
      typeof postItem.simulados_count === "number" ||
      typeof postItem.infographics_count === "number";

    let flashcardsCount = 0;
    let questionsCount = 0;
    let simuladosCount = 0;
    let infographicsCount = 0;

    if (hasPrecomputedCounts) {
      flashcardsCount = postItem.flashcards_count || 0;
      questionsCount = postItem.questions_count || 0;
      simuladosCount = postItem.simulados_count || 0;
      infographicsCount = postItem.infographics_count || 0;
    } else {
      const hasColumnStudyData =
        postItem.study_data &&
        typeof postItem.study_data === "object" &&
        Object.keys(postItem.study_data).length > 0;
      const parsed = (
        hasColumnStudyData
          ? postItem.study_data
          : extractStudyDataFromContentHtml(postItem.content_html || "")
      ) as any;

      flashcardsCount = Array.isArray(parsed?.flashcards) ? parsed.flashcards.length : 0;
      questionsCount = Array.isArray(parsed?.questions) ? parsed.questions.length : 0;
      simuladosCount = Array.isArray(parsed?.simulados) ? parsed.simulados.length : 0;
      infographicsCount = Array.isArray(parsed?.infographics) ? parsed.infographics.length : 0;
    }

    const totalStudyItems = flashcardsCount + questionsCount + simuladosCount + infographicsCount;
    const readMinsMatch = (postItem.read_time || "").match(/\d+/);
    const readMins = readMinsMatch ? parseInt(readMinsMatch[0], 10) : 6;

    return {
      post: postItem,
      flashcardsCount,
      questionsCount,
      simuladosCount,
      infographicsCount,
      totalStudyItems,
      readMins,
    };
  });

  const totalFlashcards = postMetrics.reduce((acc, m) => acc + m.flashcardsCount, 0);
  const totalQuestionsAndSimulados = postMetrics.reduce(
    (acc, m) => acc + m.questionsCount + m.simuladosCount,
    0
  );
  const totalStudyResources = postMetrics.reduce((acc, m) => acc + m.totalStudyItems, 0);
  const totalRealViews = posts.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const avgReadMinutes =
    postMetrics.length > 0
      ? Math.round(postMetrics.reduce((acc, m) => acc + m.readMins, 0) / postMetrics.length)
      : 0;

  const topStudyPosts = [...postMetrics]
    .sort((a, b) => b.totalStudyItems - a.totalStudyItems)
    .slice(0, 5);
  const maxStudyItems = Math.max(1, topStudyPosts[0]?.totalStudyItems || 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" /> Métricas Reais do Inventário Editorial
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit">
            Estatísticas & Inventário de Estudo
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Dados calculados em tempo real a partir dos artigos, flashcards, questões, simulados e
            infográficos cadastrados no Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10 flex-wrap">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="block text-2xl font-black text-sky-400 font-outfit">
              {totalRealViews.toLocaleString("pt-BR")}
            </span>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Views Reais
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="block text-2xl font-black text-emerald-400 font-outfit">
              {totalStudyResources.toLocaleString("pt-BR")}
            </span>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Itens de Estudo
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="block text-2xl font-black text-amber-400 font-outfit">
              {avgReadMinutes} min
            </span>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Leitura Média
            </span>
          </div>
        </div>
      </div>

      {/* 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Artigos Publicados
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
            {posts.filter((p) => p.is_published !== false).length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Conteúdo ativo visível no site</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fila Editorial
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FileEdit className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
            {posts.filter((p) => p.is_published === false).length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Rascunhos ou pendentes de revisão</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Questões & Simulados
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
            {totalQuestionsAndSimulados.toLocaleString("pt-BR")}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span>Total de questões acopladas aos artigos</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Flashcards no Acervo
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
            {totalFlashcards.toLocaleString("pt-BR")}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cards de memorização ativa disponíveis</span>
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Artigos Mais Completos em Ferramentas de Estudo
            </h3>
            <span className="text-xs font-semibold text-slate-400">Dados reais do banco</span>
          </div>

          <div className="space-y-4">
            {topStudyPosts.map((metric, idx) => {
              const pct = Math.max(5, Math.round((metric.totalStudyItems / maxStudyItems) * 100));

              return (
                <div
                  key={metric.post.id}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {metric.post.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                        {metric.post.category_slug}
                      </span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        {metric.flashcardsCount} FC • {metric.questionsCount} Q • {metric.simuladosCount} Sim
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Artigos por Categoria Principal
            </h3>

            <div className="space-y-3 pt-2">
              {[
                { key: "estude", label: "Estude", color: "bg-emerald-500" },
                { key: "aprenda", label: "Aprenda", color: "bg-amber-500" },
                { key: "estude-comigo", label: "Estude comigo", color: "bg-red-500" },
                { key: "informe-se", label: "Informe-se", color: "bg-blue-500" },
                { key: "rotina", label: "Rotina", color: "bg-purple-500" },
              ].map((cat) => {
                const count = posts.filter((p) => p.category_slug === cat.key).length;
                const pct = posts.length > 0 ? Math.round((count / posts.length) * 100) : 0;

                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.label}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {count} artigos ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full`}
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              Status da Produção Editorial
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400 font-outfit">
                  {posts.filter((p) => p.is_published !== false).length}
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Publicados
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                <span className="block text-xl font-bold text-amber-600 dark:text-amber-400 font-outfit">
                  {posts.filter((p) => p.is_published === false).length}
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Rascunhos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
