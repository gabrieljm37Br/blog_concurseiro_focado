"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, CheckCircle2, XCircle } from "lucide-react";

interface QuestionBlockProps {
  type: "certo_errado" | "multipla_escolha";
  banca?: string;
  questionNumber?: number | string;
  contextText?: string;
  statement: string;
  options?: string[];
  gabarito: string;
  comentario: string;
  className?: string;
}

export function QuestionBlock({
  type,
  banca,
  questionNumber = 1,
  contextText,
  statement,
  options = [],
  gabarito,
  comentario,
  className = "",
}: QuestionBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const isCertoErrado = type === "certo_errado";
  const isCorrect = gabarito.toUpperCase().includes("CERTO");

  return (
    <article
      className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 my-6 shadow-sm ${className}`}
      aria-label={`Questão ${questionNumber}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
            isCertoErrado
              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          {banca ? `${banca} / ` : ""}
          {isCertoErrado ? "CERTO OU ERRADO" : "MÚLTIPLA ESCOLHA"}
        </span>
        <span className="text-xs text-slate-500 font-medium">Questão {questionNumber}</span>
      </div>

      {contextText && (
        <p className="text-slate-800 dark:text-slate-200 font-medium text-sm mb-3 leading-relaxed">
          {contextText}
        </p>
      )}

      {isCertoErrado ? (
        <blockquote className="p-4 my-3 bg-white dark:bg-slate-900 border-l-4 border-sky-500 text-sm text-slate-700 dark:text-slate-300 rounded-r-xl italic leading-relaxed">
          "{statement}"
        </blockquote>
      ) : (
        <p className="text-slate-800 dark:text-slate-200 text-sm mb-4 leading-relaxed font-semibold">
          {statement}
        </p>
      )}

      {/* Alternativas de Múltipla Escolha */}
      {!isCertoErrado && options.length > 0 && (
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-4 pl-1" role="list">
          {options.map((opt, idx) => {
            const letter = opt.substring(0, 2).trim().toUpperCase();
            const isSelected = selectedOption === letter || selectedOption === opt;
            return (
              <li
                key={idx}
                onClick={() => setSelectedOption(letter)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500 text-slate-950 dark:text-white font-semibold"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-emerald-400"
                }`}
              >
                <span>{opt}</span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Botão de Revelação de Gabarito / Spoiler */}
      <details
        className="estudo-spoiler mt-4"
        open={isOpen}
        onToggle={(e) => setIsOpen((e.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer font-bold text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between">
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            🔍 Clique para ver o Gabarito e Comentário Detalhado
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </summary>
        <div className="spoiler-conteudo mt-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-sm">
          <p
            className={`font-black text-base mb-2 flex items-center gap-1.5 ${
              isCorrect || gabarito.length <= 3 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isCorrect || gabarito.length <= 3 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500" />
            )}
            Gabarito: {gabarito}
          </p>
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
            <strong>Comentário Detalhado:</strong>
            <p>{comentario}</p>
          </div>
        </div>
      </details>
    </article>
  );
}
