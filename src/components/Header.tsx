"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Target, 
  BookOpen, 
  BrainCircuit, 
  Newspaper, 
  ShoppingBag, 
  User, 
  Sun, 
  Moon, 
  Menu, 
  X,
  ChevronDown,
  Coffee,
  Search,
  ArrowRight,
  Sparkles,
  Send,
  Mail
} from "lucide-react";
import YouTubeIcon from "@/components/icons/YouTubeIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import Logo from "@/components/Logo";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";

import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEstudeDropdownOpen, setIsEstudeDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                   localStorage.getItem("theme") === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      setIsDarkMode(true);
    }

    // Shortcut Ctrl+K / Cmd+K listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const [dbSubcategories, setDbSubcategories] = useState<string[]>([]);
  const [dbSearchPosts, setDbSearchPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHeaderData() {
      try {
        const { data: subData } = await supabase
          .from("posts")
          .select("subcategory")
          .not("subcategory", "is", null);

        if (subData) {
          const subs = Array.from(new Set(subData.map((d: any) => d.subcategory).filter(Boolean)));
          setDbSubcategories(subs);
        }

        const { data: postsData } = await supabase
          .from("posts")
          .select("id, title, slug, summary, subcategory, banca, category_slug, is_published");

        if (postsData) {
          const valid = postsData.filter((p: any) => p.is_published !== false);
          setDbSearchPosts(valid);
        }
      } catch (e) {
        console.warn("Erro ao carregar dados do Header:", e);
      }
    }
    fetchHeaderData();
  }, []);

  const defaultDisciplinas = [
    "Direito Constitucional",
    "Direito Administrativo",
    "Língua Portuguesa",
    "Raciocínio Lógico",
    "Informática para Concursos"
  ];

  const allSubcategories = Array.from(new Set([...defaultDisciplinas, ...dbSubcategories]));
  const estudeDisciplinas = allSubcategories.map((name) => ({
    name,
    href: `/?q=${encodeURIComponent(name)}`
  }));

  // Filter posts dynamically for search modal
  const filteredSearchResults = searchQuery.trim() === "" 
    ? [] 
    : dbSearchPosts.filter(post => {
        const q = searchQuery.toLowerCase();
        const catName = post.category_slug || "Estude";
        return (
          (post.title && post.title.toLowerCase().includes(q)) ||
          (catName && catName.toLowerCase().includes(q)) ||
          (post.subcategory && post.subcategory.toLowerCase().includes(q)) ||
          (post.banca && post.banca.toLowerCase().includes(q)) ||
          (post.summary && post.summary.toLowerCase().includes(q))
        );
      });

  return (
    <>
      {/* TOP UTILITY BAR (Redes Sociais & Links Institucionais) */}
      <div className="bg-slate-900 dark:bg-[#070A10] text-slate-300 text-[11px] font-medium border-b border-slate-800 transition-colors z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4">
          
          {/* Left: Links Institucionais (visíveis em telas sm+) */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
            <Link href="/sobre" className="hover:text-emerald-400 transition-colors">
              Sobre nós
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/privacidade" className="hover:text-emerald-400 transition-colors">
              Política de Privacidade
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/termos" className="hover:text-emerald-400 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/contato" className="hover:text-emerald-400 transition-colors">
              Contato
            </Link>
          </div>

          {/* Left: Título Limpo para Telas Pequenas (Mobile) */}
          <div className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Concurseiro Focado
          </div>

          {/* Right: Redes Sociais */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Siga-nos:
            </span>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
              title="YouTube Concurseiro Focado"
            >
              <YouTubeIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-1"
              title="Instagram @concurseirofocado"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instagram</span>
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
              title="Comunidade Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telegram</span>
            </a>
          </div>

        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors shadow-xs">
        
        {/* ROW 1: BRAND LOGO + CENTER PROMINENT SEARCH BAR + RIGHT ACTION BUTTONS (Gran Cursos Style) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-6">
            
            {/* Logo Oficial */}
            <Logo showTagline={true} />

            {/* Gran Cursos Style - Center Prominent Search Bar (Desktop & Tablet) */}
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-2 lg:mx-6">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all border border-slate-200/80 dark:border-slate-700/60 shadow-inner group cursor-pointer"
                title="Buscar no Blog (Ctrl + K)"
                aria-label="Buscar matérias"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Search className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Buscar artigos, matérias ou bancas...
                  </span>
                </div>
                <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Mobile Only Search Icon Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/60"
                title="Buscar no Blog"
                aria-label="Buscar matérias"
              >
                <Search className="w-5 h-5 text-emerald-500" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
                title="Alternar Modo Escuro/Claro"
                aria-label="Alternar Modo Escuro"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* PWA Download APP Button (Desktop Header) */}
              <InstallAppButton variant="header" className="hidden lg:inline-flex" />

              {/* Area de Membros Login Button */}
              <Link
                href="/membros/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Área de Membros</span>
                <span className="hidden xl:inline text-[10px] bg-emerald-800/60 px-1.5 py-0.5 rounded text-emerald-100 font-semibold">
                  Zero Ads
                </span>
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                aria-label="Abrir menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>

          </div>
        </div>

        {/* ROW 2: CATEGORY NAVIGATION SUB-BAR (Direção & Gran Cursos Style - Desktop) */}
        <div className="header-subnav border-t border-b border-slate-200/80 dark:border-slate-800/90 bg-slate-100/90 dark:bg-[#070A12] hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between gap-1 xl:gap-2 text-xs xl:text-sm font-semibold py-1.5">
              
              {/* Left Category Links */}
              <div className="flex items-center gap-1 xl:gap-2">
                
                {/* Dropdown Estude */}
                <div 
                  className="relative"
                  onMouseEnter={() => setIsEstudeDropdownOpen(true)}
                  onMouseLeave={() => setIsEstudeDropdownOpen(false)}
                >
                  <button 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold cursor-pointer"
                    aria-expanded={isEstudeDropdownOpen}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Estude</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isEstudeDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isEstudeDropdownOpen && (
                    <div className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Disciplinas Principais
                      </div>
                      {estudeDisciplinas.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-xs xl:text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aprenda */}
                <Link
                  href="/aprenda"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold whitespace-nowrap"
                >
                  <BrainCircuit className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Aprenda</span>
                </Link>

                {/* Estude comigo (YouTube) */}
                <Link
                  href="/estude-comigo"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold whitespace-nowrap"
                >
                  <YouTubeIcon className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Estude comigo</span>
                </Link>

                {/* Informe-se */}
                <Link
                  href="/informe-se"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold whitespace-nowrap"
                >
                  <Newspaper className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Informe-se</span>
                </Link>

                {/* Rotina */}
                <Link
                  href="/rotina"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold whitespace-nowrap"
                >
                  <Coffee className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Rotina</span>
                </Link>

              </div>

              {/* Right Special App Store Link */}
              <Link
                href="/loja"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all font-extrabold whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Loja de APPs</span>
                <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500 text-slate-950 rounded font-black uppercase">
                  Exclusivo
                </span>
              </Link>

            </nav>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] px-4 pt-2 pb-6 space-y-3">
            
            <div className="font-semibold text-xs text-slate-400 uppercase tracking-wider px-2">
              Navegação
            </div>

            <div className="space-y-1">
              <div className="px-3 py-2 font-semibold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" /> Estude (Disciplinas)
                </span>
              </div>
              <div className="pl-6 space-y-1 border-l-2 border-emerald-500/30 ml-3">
                {estudeDisciplinas.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/aprenda"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <BrainCircuit className="w-4 h-4 text-amber-500" /> Aprenda (Técnicas)
            </Link>

            <Link
              href="/estude-comigo"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <YouTubeIcon className="w-4 h-4 text-red-500" /> Estude comigo (YouTube)
            </Link>

            <Link
              href="/informe-se"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Newspaper className="w-4 h-4 text-blue-500" /> Informe-se (Editais)
            </Link>

            <Link
              href="/rotina"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Coffee className="w-4 h-4 text-orange-500" /> Rotina de Estudos
            </Link>

            <Link
              href="/loja"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <ShoppingBag className="w-4 h-4" /> Loja de APPs & Afiliados
            </Link>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <InstallAppButton variant="mobile" />
              <Link
                href="/membros/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm"
              >
                <User className="w-4 h-4" /> Entrar na Área de Membros (Sem Ads)
              </Link>
            </div>

          </div>
        )}
      </header>

      {/* SEARCH MODAL OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]">
              <Search className="w-5 h-5 text-emerald-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O que você quer estudar hoje? Ex: Constitucional, Flashcards, Cebraspe..."
                className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 transition-colors"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3 bg-white dark:bg-[#111827]">
              {searchQuery.trim() === "" ? (
                <div className="p-8 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Digite um tema, matéria ou banca examinadora para buscar.
                  </h4>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {["Direito Constitucional", "Flashcards", "Cebraspe", "FGV", "Repetição Espaçada"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-700/60"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Nenhum artigo encontrado para "<strong className="text-amber-500 dark:text-amber-400">{searchQuery}</strong>". Tente termos como <em>Constitucional</em> ou <em>Flashcards</em>.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Artigos Encontrados ({filteredSearchResults.length})
                  </div>
                  {filteredSearchResults.map((post) => (
                    <Link
                      key={post.id}
                      href={`/artigo/${post.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all block space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {post.category || post.category_slug || "Estude"}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1 group-hover:text-emerald-500">
                          Ler artigo <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-outfit">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {post.summary}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-5 py-2.5 bg-slate-100 dark:bg-[#0B0F19] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Pressione <strong className="text-slate-700 dark:text-slate-200">ESC</strong> para fechar</span>
              <span><strong className="text-slate-700 dark:text-slate-200">Concurseiro Focado</strong> • Busca Inteligente</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
