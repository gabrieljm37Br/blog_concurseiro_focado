"use client";

import React, { useState } from "react";
import { Lightbulb, AlertTriangle, Scale, Copy, Check } from "lucide-react";

export type CalloutType = "dica" | "pegadinha" | "lei";

interface CalloutProps {
  type: CalloutType;
  title?: string;
  lawRef?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ type, title, lawRef, children, className = "" }: CalloutProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window === "undefined") return;
    const textToCopy = typeof children === "string" ? children : (document.getElementById(`callout-lei-${title || lawRef}`)?.innerText || "");
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (type === "dica") {
    return (
      <aside className={`callout-dica ${className}`} role="note" aria-label="Dica de Prova">
        <div className="callout-header">
          <Lightbulb className="w-5 h-5 text-emerald-500 animate-pulse" />
          <span>{title || "💡 DICA DE PROVA / MACETE"}</span>
        </div>
        <div className="text-slate-800 dark:text-slate-200 leading-relaxed">{children}</div>
      </aside>
    );
  }

  if (type === "pegadinha") {
    return (
      <aside className={`callout-pegadinha ${className}`} role="alert" aria-label="Pegadinha da Banca">
        <div className="callout-header">
          <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />
          <span>{title || "⚠️ CUIDADO COM A PEGADINHA DA BANCA!"}</span>
        </div>
        <div className="text-slate-800 dark:text-slate-200 leading-relaxed">{children}</div>
      </aside>
    );
  }

  return (
    <aside className={`callout-lei ${className}`} role="region" aria-label="Dispositivo Legal">
      <div className="lei-header">
        <span className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-purple-500" />
          {title || lawRef || "📜 DISPOSITIVO LEGAL"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-copiar-lei flex items-center gap-1"
          title="Copiar texto da lei"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <blockquote id={`callout-lei-${title || lawRef}`} className="italic">
        {children}
      </blockquote>
    </aside>
  );
}
