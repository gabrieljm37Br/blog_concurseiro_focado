"use client";

import React from "react";
import { usePWA } from "./PWAContext";
import { Download, Check, Sparkles } from "lucide-react";

interface InstallAppButtonProps {
  variant?: "header" | "mobile" | "compact" | "banner";
  className?: string;
}

export function InstallAppButton({ variant = "header", className = "" }: InstallAppButtonProps) {
  const { openInstallModal, isStandalone, isInstalledSuccess, triggerNativeInstall, isInstallable } = usePWA();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInstallable) {
      const installed = await triggerNativeInstall();
      if (!installed) {
        openInstallModal();
      }
    } else {
      openInstallModal();
    }
  };

  const displayClass = className.includes("flex") || className.includes("hidden") || className.includes("block") 
    ? className 
    : `inline-flex ${className}`;

  if (isStandalone || isInstalledSuccess) {
    if (variant === "mobile") {
      return (
        <div className={`flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold ${className}`}>
          <Check className="w-4 h-4" />
          <span>APP Instalado</span>
        </div>
      );
    }
    return (
      <div className={`items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold ${displayClass}`}>
        <Check className="w-3.5 h-3.5" />
        <span>APP Instalado</span>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <button
        onClick={handleClick}
        className={`w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 active:from-emerald-600 active:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Baixar Aplicativo (APP)</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <button
        onClick={handleClick}
        className={`py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Instalar APP Grátis</span>
      </button>
    );
  }

  // Header Default Variant
  return (
    <button
      onClick={handleClick}
      title="Baixar blog em forma de aplicativo no celular ou computador"
      className={`items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500/60 rounded-full text-xs font-bold transition-all duration-200 group shadow-sm hover:shadow ${displayClass}`}
    >
      <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
      <span>Baixar APP</span>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
    </button>
  );
}
