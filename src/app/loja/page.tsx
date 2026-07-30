"use client";

import React from "react";
import Link from "next/link";
import { MOCK_APPS } from "@/data/mockPosts";
import { ShoppingBag, Target, BookOpen, CheckCircle2, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";

export default function LojaPage() {
  const affiliateProducts = [
    {
      id: "aff-1",
      name: "Pacote Vade Mecum Esquematizado Concursos 2026",
      tagline: "Legislação destacada com prazos e pegadinhas de bancas",
      description: "Material recomendado e utilizado nos vídeos do canal para revisão rápida de artigos de lei.",
      price: "R$ 67,00",
      type: "Livro / Material Digital (Afiliado)",
      link: "#"
    },
    {
      id: "aff-2",
      name: "Curso de Português Prático para Cebraspe & FGV",
      tagline: "Gramática e interpretação focadas no perfil das bancas",
      description: "Curso parceiro de alta conversão recomendado para quem tem dificuldades com a banca FGV.",
      price: "R$ 147,00",
      type: "Curso Online (Afiliado)",
      link: "#"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4" /> Loja & Ferramentas Concurseiro Focado
        </span>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white">
          APPs Próprios & Recomendados
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Nossos APPs nasceram da necessidade real de otimizar a rotina de estudos do autor. Conheça as ferramentas em teste e os materiais recomendados.
        </p>
      </div>

      {/* PROPRIETARY APPS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" /> APPs Próprios (Desenvolvidos pelo Autor)
          </h2>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
            🧪 Atualmente em Fase de Testes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_APPS.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                      {app.pricingType}
                    </span>
                    <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">
                      {app.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {app.price}
                    </span>
                    <span className="block text-[10px] text-slate-400">Preço Acessível</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {app.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Funcionalidades Principais:
                  </span>
                  {app.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Em Breve (Em Fase de Testes com o Autor)
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* AFFILIATE PRODUCTS SECTION */}
      <section className="space-y-6 pt-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" /> Materiais Recomendados & Afiliados
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {affiliateProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                    {prod.type}
                  </span>
                  <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">
                    {prod.name}
                  </h3>
                </div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {prod.price}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {prod.description}
              </p>

              <div className="pt-2">
                <a
                  href={prod.link}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  Conhecer Material <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
