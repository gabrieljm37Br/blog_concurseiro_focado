"use client";

import React, { useMemo } from "react";
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Search } from "lucide-react";
import { runSemanticLinter } from "@/lib/semanticLinter";

interface SemanticLintBannerProps {
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  featuredImage: string;
  tags: string;
  studyData: {
    flashcards: any[];
    questions: any[];
    simulados: any[];
    infographics: any[];
  };
}

export default function SemanticLintBanner({
  title,
  slug,
  summary,
  contentHtml,
  featuredImage,
  tags,
  studyData,
}: SemanticLintBannerProps) {
  const report = useMemo(
    () =>
      runSemanticLinter({
        title,
        slug,
        summary,
        content_html: contentHtml,
        featured_image: featuredImage,
        tags,
        study_data: studyData,
      }),
    [title, slug, summary, contentHtml, featuredImage, tags, studyData]
  );

  // Só exibe depois que o autor começar a preencher o artigo
  if (!title.trim() && !contentHtml.trim()) {
    return null;
  }

  const scoreColor =
    report.score >= 85
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : report.score >= 60
      ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30";

  return (
    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold font-outfit text-slate-900 dark:text-white">
              Linter Semântico Pré-Publicação & Preview SEO
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Valida Design System Semântico, segurança HTML, OpenGraph e contratos das ferramentas de estudo.
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-xl border text-xs font-black ${scoreColor}`}>
          Qualidade: {report.score}/100
        </span>
      </div>

      {/* Preview Compacto do Google SERP */}
      {title.trim() && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Search className="w-3 h-3" /> Preview Google SERP
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
            https://concurseirofocado.com.br/artigo/{slug || "url-do-artigo"}
          </div>
          <div className="text-sm font-bold text-blue-700 dark:text-blue-400 line-clamp-1">
            {title} | Concurseiro Focado
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {summary || "Adicione um resumo persuasivo (140 a 240 caracteres) para aparecer aqui no Google e WhatsApp."}
          </p>
        </div>
      )}

      {/* Lista de Erros e Avisos */}
      {report.errors.length === 0 && report.warnings.length === 0 ? (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Tudo perfeito! Artigo 100% em conformidade com o Design System Semântico e SEO.</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {report.errors.map((err, i) => (
            <div
              key={`err-${i}`}
              className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl font-semibold"
            >
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{err.message}</span>
            </div>
          ))}
          {report.warnings.map((warn, i) => (
            <div
              key={`warn-${i}`}
              className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl font-medium"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{warn.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
