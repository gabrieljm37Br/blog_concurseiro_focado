"use client";

import React, { useState } from "react";
import { Brain, Sparkles } from "lucide-react";

export interface MnemonicoItem {
  letter: string;
  meaning: string;
  explanation?: string;
}

interface MnemonicoCardProps {
  title: string;
  items: MnemonicoItem[];
  className?: string;
}

export function MnemonicoCard({ title, items, className = "" }: MnemonicoCardProps) {
  const [activeItem, setActiveItem] = useState<MnemonicoItem | null>(null);

  return (
    <section className={`mnemonico-card ${className}`} aria-label={`Mnemônico: ${title}`}>
      <div className="mnemonico-title">
        <Brain className="w-5 h-5 text-emerald-400" />
        <span>{title}</span>
      </div>

      <div className="mnemonico-grid" role="list">
        {items.map((item, idx) => {
          const isActive = activeItem?.letter === item.letter && activeItem?.meaning === item.meaning;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveItem(isActive ? null : item)}
              className={`text-left px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold text-xs ${
                isActive
                  ? "bg-emerald-500 text-slate-950 border border-emerald-400 shadow-md scale-105"
                  : "bg-slate-800/90 text-slate-100 hover:bg-emerald-500 hover:text-slate-950 border border-slate-700"
              }`}
              title={item.explanation || item.meaning}
            >
              <strong className={isActive ? "text-slate-950 font-black pr-1" : "text-emerald-400 font-black pr-1"}>
                {item.letter}
              </strong>
              {item.meaning}
            </button>
          );
        })}
      </div>

      {activeItem?.explanation && (
        <div className="mt-2 p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">{activeItem.letter} - {activeItem.meaning}:</strong>{" "}
            {activeItem.explanation}
          </div>
        </div>
      )}
    </section>
  );
}
