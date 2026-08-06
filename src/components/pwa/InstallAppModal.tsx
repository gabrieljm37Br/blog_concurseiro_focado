"use client";

import React, { useState } from "react";
import { usePWA } from "./PWAContext";
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  CheckCircle2, 
  X, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  Zap, 
  BookOpen, 
  WifiOff 
} from "lucide-react";
import { LogoIcon } from "../Logo";

export function InstallAppModal() {
  const { 
    isModalOpen, 
    closeInstallModal, 
    isInstallable, 
    isStandalone, 
    isIOS, 
    isAndroid, 
    isDesktop,
    triggerNativeInstall,
    isInstalledSuccess
  } = usePWA();

  const [activeTab, setActiveTab] = useState<"auto" | "ios" | "android" | "desktop">(
    isIOS ? "ios" : isAndroid ? "android" : "desktop"
  );
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isModalOpen) return null;

  const handleNativeClick = async () => {
    setIsInstalling(true);
    const success = await triggerNativeInstall();
    setIsInstalling(false);
    if (success) {
      setTimeout(() => {
        closeInstallModal();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={closeInstallModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all transform animate-scale-up">
        
        {/* Header Ribbon / Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 text-white text-center">
          <button
            onClick={closeInstallModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-colors"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-3 shadow-inner ring-1 ring-white/20">
            <LogoIcon className="w-12 h-12" forceDarkTheme={true} />
          </div>

          <h3 className="text-xl sm:text-2xl font-outfit font-bold tracking-tight">
            Baixar Concurseiro Focado APP
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium max-w-sm mx-auto">
            Instale o aplicativo oficial no seu dispositivo e estude para concursos com máxima produtividade.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Installed State */}
          {isStandalone || isInstalledSuccess ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">
                Aplicativo Instalado com Sucesso!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Você já pode acessar o Concurseiro Focado direto do seu menu de aplicativos ou área de trabalho.
              </p>
            </div>
          ) : (
            <>
              {/* Native Prompt Button (when supported on Chrome/Edge/Android) */}
              {isInstallable && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Instalação Direta Disponível!</span>
                  </div>
                  <button
                    onClick={handleNativeClick}
                    disabled={isInstalling}
                    className="w-full py-3.5 px-5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5 animate-bounce" />
                    <span>{isInstalling ? "Instalando..." : "Instalar Agora em 1 Clique"}</span>
                  </button>
                </div>
              )}

              {/* App Advantages */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Zap className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">Acesso Rápido</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Direto na tela</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">Sem Distração</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Modo app nativo</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <WifiOff className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">Leitura Offline</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Cache de artigos</span>
                </div>
              </div>

              {/* Device Specific Guides Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Instruções por dispositivo:</span>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setActiveTab("ios")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "ios"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5" />
                    <span>iPhone / iPad</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("android")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "android"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Android</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("desktop")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "desktop"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Computador</span>
                  </button>
                </div>

                {/* Tab Instructions Content */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs space-y-3">
                  
                  {activeTab === "ios" && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">1</span>
                        <p className="pt-0.5">
                          Abra o blog no navegador <strong>Safari</strong> no seu iPhone ou iPad.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">2</span>
                        <p className="pt-0.5 inline-flex items-center gap-1 flex-wrap">
                          Toque no botão de <strong>Compartilhar</strong>
                          <Share2 className="w-4 h-4 text-blue-500 inline mx-0.5" />
                          na barra inferior do Safari.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">3</span>
                        <p className="pt-0.5 inline-flex items-center gap-1 flex-wrap">
                          Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>
                          <PlusSquare className="w-4 h-4 text-emerald-500 inline mx-0.5" />.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "android" && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">1</span>
                        <p className="pt-0.5">
                          No navegador <strong>Chrome, Edge ou Brave</strong>, toque no menu de três pontos <MoreVertical className="w-4 h-4 inline text-slate-500" /> no canto superior direito.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">2</span>
                        <p className="pt-0.5">
                          Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">3</span>
                        <p className="pt-0.5">
                          Confirme a instalação. O ícone aparecerá instantaneamente junto com seus apps!
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "desktop" && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">1</span>
                        <p className="pt-0.5">
                          No <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong> no seu computador (Windows/Mac).
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">2</span>
                        <p className="pt-0.5 inline-flex items-center gap-1 flex-wrap">
                          Clique no ícone de <strong>Instalar</strong> <Download className="w-4 h-4 text-emerald-500 inline mx-0.5" /> na barra de endereços (ao lado dos favoritos/favoritos de estrela).
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">3</span>
                        <p className="pt-0.5">
                          Ou clique no botão verde "Instalar Agora" acima se o prompt estiver visível no seu navegador.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </>
          )}

          {/* Footer Close */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={closeInstallModal}
              className="py-2.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
