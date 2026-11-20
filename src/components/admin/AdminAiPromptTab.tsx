"use client";

import React from "react";
import { BrainCircuit, Sparkles } from "lucide-react";
import { AI_SYSTEM_PROMPT_ARTIGOS, buildArticleAiPrompt } from "@/data/ai_prompt_instructions";

interface AdminAiPromptTabProps {
  aiPromptTopic: string;
  setAiPromptTopic: (val: string) => void;
  aiPromptBanca: string;
  setAiPromptBanca: (val: string) => void;
  onStatusMessage: (msg: string) => void;
}

export default function AdminAiPromptTab({
  aiPromptTopic,
  setAiPromptTopic,
  aiPromptBanca,
  setAiPromptBanca,
  onStatusMessage,
}: AdminAiPromptTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-500" />
              Gerador & Diretrizes de Prompt de IA (Design System Semântico)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Copie as instruções completas semânticas para enviar ao ChatGPT, Claude ou Gemini
              antes de redigir qualquer artigo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(AI_SYSTEM_PROMPT_ARTIGOS);
              onStatusMessage(
                "✅ System Prompt de IA copiado para a área de transferência com sucesso!"
              );
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Copiar System Prompt Base
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            🎯 Personalizar Prompt para um Tema Específico:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ex: Atos Administrativos - Espécies e Atributos"
              value={aiPromptTopic}
              onChange={(e) => setAiPromptTopic(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              placeholder="Banca (Ex: Cebraspe, FGV, Vunesp, FCC)"
              value={aiPromptBanca}
              onChange={(e) => setAiPromptBanca(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!aiPromptTopic.trim()) {
                  onStatusMessage("⚠️ Por favor, digite o tema do artigo.");
                  return;
                }
                const customPrompt = buildArticleAiPrompt(
                  aiPromptTopic.trim(),
                  aiPromptBanca.trim() || undefined
                );
                navigator.clipboard.writeText(customPrompt);
                onStatusMessage(
                  `✅ Prompt customizado para "${aiPromptTopic.trim()}" copiado para a área de transferência!`
                );
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Copiar Prompt Customizado sobre este Tema
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Visualização das Diretrizes de IA (Classes Semânticas sem CSS Inline):
          </label>
          <textarea
            readOnly
            rows={16}
            value={AI_SYSTEM_PROMPT_ARTIGOS}
            className="w-full p-4 rounded-2xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 focus:outline-none leading-relaxed resize-y"
          />
        </div>
      </div>
    </div>
  );
}
