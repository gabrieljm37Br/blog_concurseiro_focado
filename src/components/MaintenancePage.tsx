"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag, Wrench, Sparkles, BookOpen, CheckCircle, HelpCircle } from "lucide-react";

interface MaintenancePageProps {
  title?: string;
  categoryName?: string;
}

export default function MaintenancePage({
  categoryName = "esta seção",
}: MaintenancePageProps) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Text Content */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          
          {/* Main Title */}
          <div className="space-y-2 font-outfit font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            <span className="text-xl sm:text-2xl uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              EM MANUTENÇÃO:
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl uppercase leading-none">
              ESTAMOS{" "}
              <span className="inline-block bg-emerald-500 text-slate-950 px-3 py-1 rounded-xl shadow-md">
                MELHORANDO
              </span>
            </h1>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl uppercase leading-none">
              O SEU{" "}
              <span className="inline-block bg-emerald-500 text-slate-950 px-3 py-1 rounded-xl shadow-md">
                ESTUDO
              </span>
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
            Enquanto isso, continue focado! Voltaremos em breve com novidades para sua jornada.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-sm shadow-lg hover:scale-105 transition-all"
            >
              <Home className="w-4 h-4" />
              Voltar ao Portal
            </Link>

            <Link
              href="/loja"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              Conhecer Nossos APPs
            </Link>
          </div>

        </div>

        {/* Right Illustration Area */}
        <div className="lg:col-span-6 flex justify-center relative">
          
          <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#0F172A] text-white border border-slate-800 shadow-2xl overflow-hidden space-y-6">
            
            {/* Glow Background */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-emerald-500/40 text-xs font-bold text-emerald-400 shadow-md">
              <Wrench className="w-4 h-4 text-amber-400 animate-spin" />
              <span>AJUSTES FINAIS PARA SUA APROVAÇÃO</span>
            </div>

            {/* Interactive Robot Repairs Laptop Illustration Graphic */}
            <div className="relative min-h-[220px] rounded-2xl bg-slate-950/80 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4">
              
              {/* Glowing Study Tools inside Laptop */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-inner">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
              </div>

              {/* Robot Character Graphic */}
              <div className="space-y-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-lg relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
                  <span className="text-2xl">🤖</span>
                </div>
                <h4 className="font-bold text-sm text-white font-outfit pt-1">
                  Robô Concurseiro Focado
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Ajustando os últimos detalhes técnicos e separando os melhores materiais para você.
                </p>
              </div>

            </div>

            {/* Bottom Status Tag */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Atualização em Andamento
              </span>
              <span>Concurseiro Focado</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
