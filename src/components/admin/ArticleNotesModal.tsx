"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Save, 
  StickyNote, 
  Trash2, 
  CheckSquare, 
  AlertCircle, 
  FileText, 
  Sparkles,
  Clock,
  CheckCircle2
} from "lucide-react";

interface DbPost {
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  subcategory?: string;
  banca?: string;
  summary: string;
  content_html: string;
  read_time?: string;
  featured_image?: string;
  youtube_video_id?: string;
  tags?: any;
  published_at?: string;
  is_published?: boolean;
  admin_notes?: string;
}

interface ArticleNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: DbPost | null;
  onSaveNotes: (postId: string, notes: string) => Promise<void>;
}

export default function ArticleNotesModal({
  isOpen,
  onClose,
  post,
  onSaveNotes
}: ArticleNotesModalProps) {
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (post) {
      setNotes(post.admin_notes || "");
    } else {
      setNotes("");
    }
    setSaveSuccess(false);
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveNotes(post.id, notes);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (error) {
      console.error("Erro ao salvar notas do artigo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearNotes = () => {
    if (confirm("Tem certeza que deseja limpar as notas de ajuste deste artigo?")) {
      setNotes("");
    }
  };

  const handleAppendPreset = (presetText: string) => {
    setNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `- [ ] ${presetText}`;
      return `${trimmed}\n- [ ] ${presetText}`;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col transition-all text-slate-900 dark:text-white max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A10] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold font-outfit text-slate-900 dark:text-white">
                  Notas de Ajuste & Revisão
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  post.is_published 
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" 
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                }`}>
                  {post.is_published ? "Publicado" : "Rascunho / Em Revisão"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-md mt-0.5">
                {post.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Presets / Lembretes Rápido */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                Adicionar Ajustes Frequentes (Clique para Inserir):
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAppendPreset("Revisar jurisprudência / STF recente")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 transition-colors"
              >
                ⚖️ Revisar Jurisprudência
              </button>
              <button
                type="button"
                onClick={() => handleAppendPreset("Atualizar gabarito / questões de concurso")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 transition-colors"
              >
                📝 Atualizar Questões
              </button>
              <button
                type="button"
                onClick={() => handleAppendPreset("Corrigir erro de digitação / formatação")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition-colors"
              >
                ✏️ Formatação / Texto
              </button>
              <button
                type="button"
                onClick={() => handleAppendPreset("Adicionar caixa de Dica de Prova ou Mnemônico")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
              >
                💡 Inserir Dica / Mnemônico
              </button>
            </div>
          </div>

          {/* Textarea for Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Ajustes & Observações Internas (Visível Apenas para Autores / ADM):</span>
              {notes.trim().length > 0 && (
                <span className="text-[10px] text-purple-500 font-bold">
                  {notes.trim().split("\n").length} linha(s) de nota
                </span>
              )}
            </label>
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escreva aqui quais correções, complementos ou ajustes precisam ser feitos no artigo..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-sm font-sans leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-inner"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <span>
              <strong>Dica:</strong> Estas notas são exclusivamente internas para a equipe de autorias e revisores. Elas não aparecem na página pública do blog.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A10] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClearNotes}
            disabled={!notes || isSaving}
            className="px-3.5 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar Notas
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Nota Salva!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Salvando..." : "Salvar Notas de Ajuste"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
