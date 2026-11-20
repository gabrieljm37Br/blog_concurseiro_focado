"use client";

import React from "react";
import { FolderTree, Plus, Layers, Tag, Trash2 } from "lucide-react";

interface AdminCategoriesTabProps {
  posts: Array<{ subcategory?: string }>;
  customSubcategories: string[];
  newSubcategoryName: string;
  setNewSubcategoryName: (val: string) => void;
  newSubcategoryCategory: string;
  setNewSubcategoryCategory: (val: string) => void;
  onAddSubcategory: (e: React.FormEvent) => void;
  onDeleteSubcategory: (subName: string) => void;
  onQuickCreatePost: (subName: string) => void;
}

export default function AdminCategoriesTab({
  posts,
  customSubcategories,
  newSubcategoryName,
  setNewSubcategoryName,
  newSubcategoryCategory,
  setNewSubcategoryCategory,
  onAddSubcategory,
  onDeleteSubcategory,
  onQuickCreatePost,
}: AdminCategoriesTabProps) {
  const allSubcategories = Array.from(
    new Set([
      ...customSubcategories,
      ...posts.map((p) => p.subcategory).filter((s): s is string => Boolean(s)),
    ])
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-purple-500" />
            Organizador de Categorias & Subcategorias (Disciplinas)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cadastre novas matérias como <strong>AFO</strong>,{" "}
            <strong>Direito Constitucional</strong>, <strong>Direito Penal</strong>, etc. Todas as
            subcategorias criadas aparecem instantaneamente nos menus de navegação do site e no
            formulário de artigos.
          </p>
        </div>

        <form
          onSubmit={onAddSubcategory}
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-end gap-3"
        >
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nome da Nova Subcategoria / Matéria
            </label>
            <input
              type="text"
              required
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              placeholder="Ex: AFO, Contabilidade Pública, Direito Eleitoral..."
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="w-full sm:w-64 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Categoria Pai
            </label>
            <select
              value={newSubcategoryCategory}
              onChange={(e) => setNewSubcategoryCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="estude">Estude (Disciplinas)</option>
              <option value="aprenda">Aprenda (Técnicas)</option>
              <option value="estude-comigo">Estude comigo (YouTube)</option>
              <option value="informe-se">Informe-se (Editais)</option>
              <option value="rotina">Rotina (Organização & Foco)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Criar Subcategoria
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" /> Subcategorias Ativas no Portal (
          {allSubcategories.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allSubcategories.map((subName, idx) => {
            const count = posts.filter(
              (p) => p.subcategory?.toLowerCase() === subName.toLowerCase()
            ).length;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between gap-3 hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm font-outfit flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-500" /> {subName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {count === 1 ? "1 artigo publicado" : `${count} artigos publicados`}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onQuickCreatePost(subName)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Criar novo artigo nesta subcategoria"
                  >
                    <Plus className="w-3.5 h-3.5" /> Postar
                  </button>

                  {count === 0 && (
                    <button
                      type="button"
                      onClick={() => onDeleteSubcategory(subName)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                      title="Excluir subcategoria vazia"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
