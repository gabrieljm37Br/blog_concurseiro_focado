"use client";

import React, { useEffect, useState } from "react";
import { ListTree, ChevronDown, ChevronUp } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface ArticleTableOfContentsProps {
  containerId: string;
  contentKey: string;
}

function slugifyHeading(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base ? `sec-${base}-${index}` : `sec-topico-${index}`;
}

export default function ArticleTableOfContents({
  containerId,
  contentKey,
}: ArticleTableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [readProgress, setReadProgress] = useState<number>(0);

  // Barra de progresso de leitura vinculada ao scroll
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateProgress = () => {
      const container = document.getElementById(containerId);
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const totalScrollable = Math.max(1, container.offsetHeight - window.innerHeight * 0.65);
      const scrolled = Math.min(totalScrollable, Math.max(0, -rect.top + window.innerHeight * 0.2));
      setReadProgress(Math.round((scrolled / totalScrollable) * 100));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [containerId, contentKey]);

  // Extrai H2 e H3 do DOM renderizado e acompanha seção ativa via IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const nodes = Array.from(container.querySelectorAll("h2, h3")) as HTMLElement[];
    const items: TocItem[] = [];

    nodes.forEach((node, idx) => {
      const text = (node.textContent || "").trim();
      if (!text || text.length < 2) return;
      if (!node.id) {
        node.id = slugifyHeading(text, idx + 1);
      }
      node.style.scrollMarginTop = "5.5rem";
      items.push({
        id: node.id,
        text,
        level: node.tagName.toLowerCase() === "h2" ? 2 : 3,
      });
    });

    setHeadings(items);
    if (items.length > 0) {
      setActiveId(items[0].id);
    }

    if (items.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    nodes.forEach((n) => {
      if (n.id) observer.observe(n);
    });

    return () => observer.disconnect();
  }, [containerId, contentKey]);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <>
      {/* Barra Fixa de Progresso de Leitura no Topo da Tela */}
      <div
        className="no-print fixed top-0 left-0 right-0 z-40 h-1 bg-slate-200/40 dark:bg-slate-900/60 pointer-events-none"
        role="progressbar"
        aria-valuenow={readProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso de leitura do artigo"
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Sumário Automático (Table of Contents) */}
      {headings.length >= 2 && (
        <nav
          aria-label="Sumário do artigo"
          className="no-print rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 overflow-hidden shadow-xs"
        >
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <ListTree className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-extrabold font-outfit text-slate-900 dark:text-white">
                  Sumário do Artigo ({headings.length} tópicos)
                </span>
                <span className="ml-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {readProgress}% lido
                </span>
              </div>
            </div>

            <span className="text-slate-500 dark:text-slate-400 shrink-0">
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {isOpen && (
            <ol className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 max-h-72 overflow-y-auto">
              {headings.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                    <button
                      type="button"
                      onClick={() => handleJump(item.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2 ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold border-l-2 border-emerald-500"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 font-medium"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                      <span className="truncate">{item.text}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </nav>
      )}
    </>
  );
}
