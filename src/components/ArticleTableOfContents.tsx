"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ListTree, ChevronDown, ChevronUp, X } from "lucide-react";
import { slugifyHeadingText } from "@/lib/articleSecurity";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface ArticleTableOfContentsProps {
  containerId: string;
  contentKey: string;
}

export default function ArticleTableOfContents({
  containerId,
  contentKey,
}: ArticleTableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState<boolean>(false);
  const [showFloatingPill, setShowFloatingPill] = useState<boolean>(false);
  const [liveProgress, setLiveProgress] = useState<number>(0);
  const [maxReadProgress, setMaxReadProgress] = useState<number>(0);

  const navRef = useRef<HTMLElement | null>(null);
  const maxProgressRef = useRef<number>(0);

  // Restaura o maior percentual lido do artigo na sessão atual
  useEffect(() => {
    if (typeof window === "undefined") return;
    maxProgressRef.current = 0;
    setLiveProgress(0);
    setMaxReadProgress(0);
    try {
      const saved = Number(sessionStorage.getItem(`cf_read_pct_${contentKey}`) || "0");
      if (Number.isFinite(saved) && saved > 0 && saved <= 100) {
        maxProgressRef.current = saved;
        setMaxReadProgress(saved);
      }
    } catch {
      // sessionStorage indisponível
    }
  }, [contentKey]);

  // Monitoramento preciso de progresso de leitura + exibição do atalho flutuante
  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const computeProgress = () => {
      rafId = null;
      const container = document.getElementById(containerId);
      if (!container) return;

      const scrollTop =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 800;

      const rect = container.getBoundingClientRect();
      const articleHeight = Math.max(container.offsetHeight, container.scrollHeight, 1);
      const articleTopInDoc = rect.top + scrollTop;
      const articleBottomInDoc = articleTopInDoc + articleHeight;

      // Calcula progresso real de leitura do início ao fim do artigo:
      // - No topo (scroll <= 8px): 0%
      // - Ao rolar, acompanha a borda inferior da tela percorrendo o corpo do artigo
      // - Chega a 100% quando o fim do artigo entra na área visível da tela
      let pct = 0;
      if (scrollTop > 8) {
        const startScroll = Math.max(0, articleTopInDoc - viewportH * 0.85);
        const endScroll = Math.max(startScroll + 1, articleBottomInDoc - viewportH * 0.9);
        const raw = ((scrollTop - startScroll) / (endScroll - startScroll)) * 100;
        pct = Math.min(100, Math.max(1, Math.round(raw)));
      }

      setLiveProgress(pct);

      if (pct > maxProgressRef.current) {
        maxProgressRef.current = pct;
        setMaxReadProgress(pct);
        try {
          sessionStorage.setItem(`cf_read_pct_${contentKey}`, String(pct));
        } catch {
          // Ignora erro de quota/privacidade
        }
      }

      // Mostra pílula flutuante do sumário quando o card inline já saiu do topo da tela
      if (navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        setShowFloatingPill(navRect.bottom < 80);
      } else {
        setShowFloatingPill(scrollTop > 500);
      }
    };

    const scheduleUpdate = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(computeProgress);
      }
    };

    computeProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    document.addEventListener("scroll", scheduleUpdate, { passive: true, capture: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    const containerEl = document.getElementById(containerId);
    if (containerEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(containerEl);
    }

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
      document.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [containerId, contentKey]);

  // Extrai H2 e H3 do DOM renderizado e acompanha a seção ativa
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const nodes = Array.from(container.querySelectorAll("h2, h3")) as HTMLElement[];
    const items: TocItem[] = [];
    const seenIds = new Set<string>();

    nodes.forEach((node, idx) => {
      const text = (node.textContent || "").trim();
      if (!text || text.length < 2) return;

      let headingId = (node.id || "").trim();
      if (!headingId || seenIds.has(headingId)) {
        headingId = slugifyHeadingText(text, idx + 1);
        while (seenIds.has(headingId)) {
          headingId = `${headingId}-${idx + 1}`;
        }
        node.id = headingId;
      }
      seenIds.add(headingId);
      node.style.scrollMarginTop = "8.5rem";

      items.push({
        id: headingId,
        text,
        level: node.tagName.toLowerCase() === "h2" ? 2 : 3,
      });
    });

    setHeadings(items);
    if (items.length > 0) {
      setActiveId((prev) => (prev && seenIds.has(prev) ? prev : items[0].id));
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
      { rootMargin: "-14% 0px -68% 0px", threshold: 0 }
    );

    nodes.forEach((n) => {
      if (n.id) observer.observe(n);
    });

    return () => observer.disconnect();
  }, [containerId, contentKey]);

  // Fecha o drawer flutuante ao pressionar ESC
  useEffect(() => {
    if (!isFloatingOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFloatingOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFloatingOpen]);

  const handleJump = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string, index: number) => {
      e.preventDefault();
      if (typeof window === "undefined") return;

      const container = document.getElementById(containerId);
      let targetEl = document.getElementById(id);

      // Fallback defensivo: se o ID foi alterado ou não encontrado, localiza pelo índice/texto no container
      if (!targetEl && container) {
        const allHeadings = Array.from(container.querySelectorAll("h2, h3")).filter(
          (n) => (n.textContent || "").trim().length >= 2
        ) as HTMLElement[];
        targetEl = allHeadings[index] || null;
        if (targetEl && !targetEl.id) {
          targetEl.id = id;
        }
      }

      if (!targetEl) return;

      // Mede dinamicamente a altura real do cabeçalho sticky para nunca cobrir o título
      const stickyHeader = document.querySelector("header");
      const headerHeight = stickyHeader ? stickyHeader.getBoundingClientRect().height : 88;
      const offset = Math.ceil(headerHeight) + 20;

      const currentScrollTop =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      const targetTop = Math.max(0, Math.round(targetEl.getBoundingClientRect().top + currentScrollTop - offset));

      const prefersReducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });

      // Fallback adicional caso o navegador utilize scrollingElement diferente
      const scrollEl = document.scrollingElement;
      if (scrollEl && Math.abs(scrollEl.scrollTop - targetTop) > 4 && prefersReducedMotion) {
        scrollEl.scrollTop = targetTop;
      }

      setActiveId(id);
      setIsFloatingOpen(false);

      // Atualiza hash na URL sem disparar salto brusco nativo
      try {
        window.history.replaceState(null, "", `#${id}`);
      } catch {
        // Ignora ambientes restritos
      }

      // Destaque visual breve no tópico alvo para confirmar a navegação
      targetEl.classList.remove("toc-target-highlight");
      void targetEl.offsetWidth;
      targetEl.classList.add("toc-target-highlight");
      window.setTimeout(() => {
        targetEl?.classList.remove("toc-target-highlight");
      }, 1600);
    },
    [containerId]
  );

  const displayedProgress = Math.max(liveProgress, maxReadProgress);

  const renderTopicList = (compact = false) => (
    <ol
      className={`space-y-1 overflow-y-auto ${
        compact ? "px-3 pb-3 pt-2 max-h-[55vh]" : "px-3 sm:px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 max-h-72"
      }`}
    >
      {headings.map((item, idx) => {
        const isActive = activeId === item.id;
        return (
          <li key={item.id} className={item.level === 3 ? "pl-3 sm:pl-4" : ""}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleJump(e, item.id, idx)}
              className={`w-full text-left px-2.5 py-2 sm:py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-start sm:items-center gap-2 no-underline ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold border-l-2 border-emerald-500"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/70 font-medium"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0 mt-1.5 sm:mt-0" />
              <span className="leading-snug sm:truncate">{item.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* Barra Fixa de Progresso de Leitura no Topo da Tela */}
      <div
        className="no-print fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200/40 dark:bg-slate-900/60 pointer-events-none"
        role="progressbar"
        aria-valuenow={liveProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso de leitura do artigo"
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-150"
          style={{ width: `${liveProgress}%` }}
        />
      </div>

      {/* Sumário Automático Inline (Table of Contents) */}
      {headings.length >= 2 && (
        <nav
          ref={navRef}
          aria-label="Sumário do artigo"
          className="no-print rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 overflow-hidden shadow-xs"
        >
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="w-full px-3.5 sm:px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <ListTree className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-xs sm:text-sm font-extrabold font-outfit text-slate-900 dark:text-white">
                    Sumário do Artigo ({headings.length} tópicos)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                    {displayedProgress}% lido
                  </span>
                </div>
                <div className="w-full max-w-xs h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${displayedProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <span className="text-slate-500 dark:text-slate-400 shrink-0">
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {isOpen && renderTopicList(false)}
        </nav>
      )}

      {/* Atalho Flutuante de Sumário + % Lido em Tempo Real durante a leitura */}
      {headings.length >= 2 && showFloatingPill && (
        <div className="no-print fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 max-w-[calc(100vw-2rem)]">
          {isFloatingOpen && (
            <div className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-[#0D1322]/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ListTree className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-extrabold font-outfit text-slate-900 dark:text-white truncate">
                    Sumário ({headings.length} tópicos)
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {displayedProgress}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFloatingOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  aria-label="Fechar sumário flutuante"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderTopicList(true)}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsFloatingOpen((prev) => !prev)}
            aria-expanded={isFloatingOpen}
            className="group inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900/95 dark:bg-slate-800/95 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-100 hover:text-white dark:hover:text-slate-950 border border-slate-700/80 dark:border-emerald-500/30 shadow-xl backdrop-blur-md text-xs font-extrabold transition-all cursor-pointer"
            title="Abrir sumário rápido e acompanhar progresso de leitura"
          >
            <ListTree className="w-4 h-4 text-emerald-400 group-hover:text-white dark:group-hover:text-slate-950 transition-colors shrink-0" />
            <span>Sumário</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 group-hover:bg-white/20 dark:group-hover:bg-slate-950/20 text-emerald-300 group-hover:text-white dark:group-hover:text-slate-950 font-mono text-[11px] font-black transition-colors">
              {displayedProgress}% lido
            </span>
          </button>
        </div>
      )}
    </>
  );
}
