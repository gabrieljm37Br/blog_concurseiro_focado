"use client";

import React, { useState, useMemo } from "react";
import { 
  X, 
  Search, 
  Sparkles, 
  Code, 
  Smile, 
  Check, 
  Sliders,
  BookOpen, 
  GraduationCap, 
  Award, 
  Trophy, 
  Target, 
  FileText, 
  Brain, 
  CheckSquare, 
  Flame, 
  Lightbulb, 
  AlertTriangle, 
  Scale, 
  Landmark, 
  PenTool, 
  Calculator, 
  Clock, 
  Bookmark, 
  Pin, 
  ShieldCheck,
  Star,
  Heart,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Bell,
  Lock,
  Unlock,
  Key,
  Share2,
  Download,
  ExternalLink,
  Folder,
  Calendar,
  Mail,
  User,
  Users,
  BarChart2,
  PieChart,
  TrendingUp,
  GitMerge,
  Layers,
  Image as ImageIcon,
  Video,
  Music,
  Terminal,
  Cpu,
  Globe,
  Compass,
  MapPin,
  Zap,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  RotateCw,
  RefreshCw,
  LucideIcon
} from "lucide-react";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIcon: (htmlSnippet: string) => void;
}

// Registry of curated Lucide icons grouped for easy navigation and search
interface IconItem {
  id: string;
  name: string;
  category: "estudos" | "ui" | "midia" | "setas";
  tags: string[];
  icon: LucideIcon;
}

const ICON_REGISTRY: IconItem[] = [
  // Estudos, Leis & Concursos
  { id: "lightbulb", name: "Lâmpada / Dica", category: "estudos", tags: ["dica", "ideia", "luz"], icon: Lightbulb },
  { id: "brain", name: "Cérebro / Mnemônico", category: "estudos", tags: ["memoria", "estudo", "mente"], icon: Brain },
  { id: "book-open", name: "Livro / Leitura", category: "estudos", tags: ["estudo", "materia", "livro"], icon: BookOpen },
  { id: "graduation-cap", name: "Capelo / Aprovação", category: "estudos", tags: ["diploma", "faculdade", "concurso"], icon: GraduationCap },
  { id: "target", name: "Alvo / Foco", category: "estudos", tags: ["meta", "foco", "objetivo"], icon: Target },
  { id: "trophy", name: "Troféu / Vitória", category: "estudos", tags: ["conquista", "primeiro", "vitoria"], icon: Trophy },
  { id: "award", name: "Medalha / Mérito", category: "estudos", tags: ["premio", "certificado"], icon: Award },
  { id: "flame", name: "Fogo / Em Alta", category: "estudos", tags: ["quente", "top", "destaque"], icon: Flame },
  { id: "scale", name: "Balança / Justiça", category: "estudos", tags: ["direito", "lei", "juridico"], icon: Scale },
  { id: "landmark", name: "Governo / Órgão Publico", category: "estudos", tags: ["edital", "prefeitura", "tribunal"], icon: Landmark },
  { id: "alert-triangle", name: "Alerta / Pegadinha", category: "estudos", tags: ["cuidado", "atencao", "banca"], icon: AlertTriangle },
  { id: "file-text", name: "Edital / Prova", category: "estudos", tags: ["pdf", "prova", "documento"], icon: FileText },
  { id: "check-square", name: "Questões / Gabarito", category: "estudos", tags: ["simulado", "gabarito", "check"], icon: CheckSquare },
  { id: "pen-tool", name: "Redação / Caneta", category: "estudos", tags: ["escrita", "redacao"], icon: PenTool },
  { id: "calculator", name: "Calculadora / RLM", category: "estudos", tags: ["matematica", "contabilidade", "rlm"], icon: Calculator },
  { id: "clock", name: "Cronômetro / Tempo", category: "estudos", tags: ["horas", "prazo", "relogio"], icon: Clock },
  { id: "bookmark", name: "Marcador de Página", category: "estudos", tags: ["salvar", "favorito"], icon: Bookmark },
  { id: "pin", name: "Fixado / Importante", category: "estudos", tags: ["fixar", "pin"], icon: Pin },
  { id: "shield-check", name: "Segurança / Garantia", category: "estudos", tags: ["escudo", "protecao"], icon: ShieldCheck },
  { id: "zap", name: "Raio / Macete Rápido", category: "estudos", tags: ["rapido", "dica", "flash"], icon: Zap },

  // Interface & Destaques
  { id: "star", name: "Estrela / Destaque", category: "ui", tags: ["estrela", "favorito", "top"], icon: Star },
  { id: "heart", name: "Coração / Curtida", category: "ui", tags: ["amor", "curtir"], icon: Heart },
  { id: "check-circle", name: "Check / Correto", category: "ui", tags: ["certo", "ok", "sucesso"], icon: CheckCircle2 },
  { id: "x-circle", name: "X / Incorreto", category: "ui", tags: ["erro", "errado", "falso"], icon: XCircle },
  { id: "help-circle", name: "Dúvida / Pergunta", category: "ui", tags: ["ajuda", "questão", "faq"], icon: HelpCircle },
  { id: "info", name: "Informação / Nota", category: "ui", tags: ["info", "nota", "observacao"], icon: Info },
  { id: "bell", name: "Notificação / Sino", category: "ui", tags: ["alerta", "aviso"], icon: Bell },
  { id: "lock", name: "Cadeado Fechado", category: "ui", tags: ["privado", "exclusivo"], icon: Lock },
  { id: "unlock", name: "Cadeado Aberto", category: "ui", tags: ["acesso", "livre"], icon: Unlock },
  { id: "key", name: "Chave / Segredo", category: "ui", tags: ["gabarito", "segredo"], icon: Key },
  { id: "share2", name: "Compartilhar", category: "ui", tags: ["redes", "link"], icon: Share2 },
  { id: "download", name: "Download / Baixar", category: "ui", tags: ["arquivo", "pdf"], icon: Download },
  { id: "external-link", name: "Link Externo", category: "ui", tags: ["site", "abrir"], icon: ExternalLink },
  { id: "folder", name: "Pasta de Materiais", category: "ui", tags: ["arquivos", "pasta"], icon: Folder },
  { id: "calendar", name: "Calendário / Data", category: "ui", tags: ["cronograma", "data"], icon: Calendar },
  { id: "mail", name: "E-mail / Contato", category: "ui", tags: ["mensagem", "contato"], icon: Mail },
  { id: "user", name: "Usuário / Aluno", category: "ui", tags: ["perfil", "pessoa"], icon: User },
  { id: "users", name: "Comunidade / Alunos", category: "ui", tags: ["grupo", "forum"], icon: Users },

  // Gráficos, Tecnologia & Mídia
  { id: "bar-chart-2", name: "Gráfico de Barras", category: "midia", tags: ["estatistica", "incidencia"], icon: BarChart2 },
  { id: "pie-chart", name: "Gráfico de Pizza", category: "midia", tags: ["porcentagem", "divisao"], icon: PieChart },
  { id: "trending-up", name: "Tendência / Crescimento", category: "midia", tags: ["alta", "desempenho"], icon: TrendingUp },
  { id: "git-merge", name: "Fluxograma / Processo", category: "midia", tags: ["etapas", "caminho"], icon: GitMerge },
  { id: "layers", name: "Camadas / Níveis", category: "midia", tags: ["niveis", "etapas"], icon: Layers },
  { id: "image", name: "Imagem / Esquema", category: "midia", tags: ["foto", "grafico"], icon: ImageIcon },
  { id: "video", name: "Vídeo / Videoaula", category: "midia", tags: ["aula", "play"], icon: Video },
  { id: "music", name: "Áudio / Podcast", category: "midia", tags: ["som", "estudo"], icon: Music },
  { id: "terminal", name: "Código / TI", category: "midia", tags: ["programacao", "ti"], icon: Terminal },
  { id: "cpu", name: "Hardware / Processador", category: "midia", tags: ["tecnologia", "informatica"], icon: Cpu },
  { id: "globe", name: "Global / Web", category: "midia", tags: ["internet", "site"], icon: Globe },
  { id: "compass", name: "Bússola / Orientação", category: "midia", tags: ["guia", "direcao"], icon: Compass },
  { id: "map-pin", name: "Localização / Local", category: "midia", tags: ["mapa", "cidade"], icon: MapPin },

  // Setas
  { id: "arrow-right", name: "Seta Direita", category: "setas", tags: ["proximo", "avancar"], icon: ArrowRight },
  { id: "arrow-left", name: "Seta Esquerda", category: "setas", tags: ["voltar", "anterior"], icon: ArrowLeft },
  { id: "arrow-up-right", name: "Seta Diagonal", category: "setas", tags: ["link", "externo"], icon: ArrowUpRight },
  { id: "chevron-right", name: "Chevron Direita", category: "setas", tags: ["item", "passo"], icon: ChevronRight },
  { id: "rotate-cw", name: "Reciclar / Revisão", category: "setas", tags: ["repeticao", "revisar"], icon: RotateCw },
  { id: "refresh-cw", name: "Atualizar / Ciclo", category: "setas", tags: ["ciclo", "renovar"], icon: RefreshCw }
];

const EMOJI_LIST = [
  { emoji: "💡", label: "Dica / Ideia" },
  { emoji: "⚠️", label: "Alerta / Pegadinha" },
  { emoji: "📜", label: "Lei / Artigo" },
  { emoji: "🧠", label: "Mnemônico / Memória" },
  { emoji: "⚡", label: "Macete / Rápido" },
  { emoji: "📊", label: "Gráfico / Incidência" },
  { emoji: "🔄", label: "Fluxo / Processo" },
  { emoji: "🎯", label: "Foco / Alvo" },
  { emoji: "🚀", label: "Alta Performance" },
  { emoji: "🏆", label: "Aprovação" },
  { emoji: "✅", label: "Correto" },
  { emoji: "❌", label: "Incorreto" },
  { emoji: "📌", label: "Fixado" },
  { emoji: "🏷️", label: "Tag / Rótulo" },
  { emoji: "🔑", label: "Gabarito" },
  { emoji: "🎓", label: "Estudos" },
  { emoji: "💻", label: "Informática" },
  { emoji: "📅", label: "Cronograma" },
  { emoji: "⏱️", label: "Tempo / Prazo" },
  { emoji: "⭐", label: "Destaque" },
  { emoji: "🔥", label: "Em Alta" }
];

// Color Options
const COLOR_OPTIONS = [
  { id: "currentColor", name: "Herdar Cor do Texto", value: "currentColor", bgClass: "bg-slate-700 dark:bg-slate-200" },
  { id: "emerald", name: "Verde Esmeralda", value: "#10b981", bgClass: "bg-emerald-500" },
  { id: "amber", name: "Amarelo Ouro", value: "#f59e0b", bgClass: "bg-amber-500" },
  { id: "purple", name: "Roxo Púrpura", value: "#a855f7", bgClass: "bg-purple-500" },
  { id: "blue", name: "Azul Royal", value: "#3b82f6", bgClass: "bg-blue-500" },
  { id: "red", name: "Vermelho Alerta", value: "#ef4444", bgClass: "bg-red-500" },
  { id: "cyan", name: "Ciano Neon", value: "#06b6d4", bgClass: "bg-cyan-500" },
  { id: "pink", name: "Rosa Destaque", value: "#ec4899", bgClass: "bg-pink-500" }
];

// SVG Paths helper for crisp inline rendering
const LUCIDE_PATH_MAP: Record<string, string> = {
  "lightbulb": '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  "brain": '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M12 5v13"/>',
  "book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  "graduation-cap": '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  "target": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  "trophy": '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v9a6 6 0 0 0 12 0V2z"/>',
  "award": '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  "flame": '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  "scale": '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/>',
  "landmark": '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/><line x1="2" x2="22" y1="18" y2="18"/>',
  "alert-triangle": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  "file-text": '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
  "check-square": '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  "pen-tool": '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  "calculator": '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
  "clock": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  "bookmark": '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  "pin": '<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
  "shield-check": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  "zap": '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  "star": '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  "heart": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  "check-circle": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  "x-circle": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  "help-circle": '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  "info": '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>',
  "bell": '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  "lock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  "unlock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  "key": '<path d="m21 2-2 2m-1.5 1.5L14 9.5a5 5 0 1 0 4.5 4.5l-4-4"/><path d="m15.5 7.5 3 3"/>',
  "share2": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  "external-link": '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>',
  "folder": '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
  "calendar": '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  "users": '<path d="M16 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 0-4-4H3a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  "bar-chart-2": '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
  "pie-chart": '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  "trending-up": '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  "git-merge": '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9v12"/><path d="M21 3a9 9 0 0 1-9 9H6"/>',
  "layers": '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  "image": '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  "video": '<polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/>',
  "music": '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  "terminal": '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  "cpu": '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
  "globe": '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  "compass": '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  "arrow-right": '<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  "arrow-left": '<line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  "arrow-up-right": '<line x1="7" x2="17" y1="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
  "chevron-right": '<polyline points="9 18 15 12 9 6"/>',
  "rotate-cw": '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'
};

export default function IconPickerModal({ isOpen, onClose, onInsertIcon }: IconPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "custom-svg" | "emoji">("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Icon Customization State
  const [selectedIconId, setSelectedIconId] = useState<string>("lightbulb");
  const [selectedSize, setSelectedSize] = useState<number>(24);
  const [selectedColor, setSelectedColor] = useState<string>("currentColor");
  const [customHexColor, setCustomHexColor] = useState<string>("#10b981");
  const [useCustomColorInput, setUseCustomColorInput] = useState<boolean>(false);
  const [layoutStyle, setLayoutStyle] = useState<"inline" | "card" | "list">("inline");
  const [cardTitle, setCardTitle] = useState("Destaque Importante");

  // Custom SVG State (User pasted code)
  const [customSvgCode, setCustomSvgCode] = useState<string>(
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 8v4l3 3" />
</svg>`
  );

  // Filter icons based on search query and category
  const filteredIcons = useMemo(() => {
    return ICON_REGISTRY.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !query || 
        item.name.toLowerCase().includes(query) || 
        item.tags.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const currentIconObj = ICON_REGISTRY.find(i => i.id === selectedIconId) || ICON_REGISTRY[0];
  const ActiveIconComponent = currentIconObj.icon;

  const finalColorValue = useCustomColorInput ? customHexColor : selectedColor;

  // Generate the HTML snippet to insert into the editor
  const handleConfirmInsert = () => {
    let htmlSnippet = "";

    if (activeTab === "library") {
      const colorAttr = finalColorValue;
      const sizePx = selectedSize;
      const innerPaths = LUCIDE_PATH_MAP[selectedIconId] || LUCIDE_PATH_MAP["lightbulb"];
      
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="${colorAttr}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block align-middle shrink-0 my-0.5 mx-1" style="width: ${sizePx}px; height: ${sizePx}px; display: inline-block; vertical-align: middle; color: ${colorAttr};">${innerPaths}</svg>`;

      if (layoutStyle === "inline") {
        htmlSnippet = `${svgMarkup}&nbsp;`;
      } else if (layoutStyle === "card") {
        const cardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(28, sizePx)}" height="${Math.max(28, sizePx)}" viewBox="0 0 24 24" fill="none" stroke="${colorAttr}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${colorAttr};">${innerPaths}</svg>`;
        htmlSnippet = `\n<div class="my-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/40 dark:via-[#0F172A] dark:to-emerald-900/20 border border-emerald-500/30 shadow-md flex items-start gap-3.5">
  <div class="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
    ${cardSvg}
  </div>
  <div>
    <h4 class="font-extrabold text-slate-900 dark:text-white text-base mb-1">${cardTitle || "Destaque Importante"}</h4>
    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Escreva seu texto em destaque aqui...</p>
  </div>
</div>\n`;
      } else if (layoutStyle === "list") {
        htmlSnippet = `\n<div class="flex items-center gap-2.5 my-2 text-slate-800 dark:text-slate-200 font-medium">
  ${svgMarkup}
  <span>Tópico em destaque com ícone personalizado...</span>
</div>\n`;
      }
    } else if (activeTab === "custom-svg") {
      let cleanedCode = customSvgCode.trim();
      
      // Inject explicit width, height and inline style on <svg> tag so browsers never collapse dimensions
      cleanedCode = cleanedCode.replace(/<svg\b([^>]*)>/i, (_, attrs) => {
        let updatedAttrs = attrs;
        if (!/width=/i.test(updatedAttrs)) updatedAttrs += ` width="${selectedSize}"`;
        if (!/height=/i.test(updatedAttrs)) updatedAttrs += ` height="${selectedSize}"`;
        if (!/style=/i.test(updatedAttrs)) {
          updatedAttrs += ` style="width: ${selectedSize}px; height: ${selectedSize}px; display: inline-block; vertical-align: middle; color: ${finalColorValue};"`;
        } else {
          updatedAttrs = updatedAttrs.replace(/style="([^"]*)"/i, `style="$1; width: ${selectedSize}px; height: ${selectedSize}px; display: inline-block; vertical-align: middle;"`);
        }
        return `<svg${updatedAttrs}>`;
      });

      if (finalColorValue !== "currentColor") {
        cleanedCode = cleanedCode.replace(/stroke="currentColor"/gi, `stroke="${finalColorValue}"`);
      }
      
      htmlSnippet = `${cleanedCode}&nbsp;`;
    } else if (activeTab === "emoji") {
      htmlSnippet = `<span class="text-xl inline-block align-middle mx-0.5" style="font-size: ${selectedSize}px;">${selectedIconId}</span>&nbsp;`;
    }

    onInsertIcon(htmlSnippet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Dialog Box */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-white transition-all">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#070A10]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Inserir Ícones no Artigo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escolha ícones vetoriais da biblioteca ou cole seu código SVG autoral customizado.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-[#0B0F19] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "library"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#0F172A]"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Biblioteca Vetorial (Lucide)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom-svg")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "custom-svg"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#0F172A]"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Code className="w-4 h-4" /> SVG Customizado (Cole seu Código)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("emoji")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "emoji"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#0F172A]"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Smile className="w-4 h-4" /> Emojis de Destaque
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: Biblioteca de Ícones */}
          {activeTab === "library" && (
            <div className="space-y-5">
              
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar ícone (ex: lâmpada, cérebro, lei, estrela, alvo)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Categories Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "estudos", label: "Estudos / Leis" },
                    { id: "ui", label: "Interface / UI" },
                    { id: "midia", label: "Gráficos / Mídia" },
                    { id: "setas", label: "Setas" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-[240px] overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-[#070A10]/50">
                {filteredIcons.length > 0 ? (
                  filteredIcons.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedIconId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedIconId(item.id)}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all group relative border ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30 scale-105"
                            : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                        }`}
                        title={item.name}
                      >
                        <IconComp className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-semibold truncate w-full text-center opacity-80">
                          {item.name.split("/")[0]}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-8 text-center text-xs text-slate-400">
                    Nenhum ícone encontrado para "{searchQuery}".
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SVG Customizado (Código do Autor) */}
          {activeTab === "custom-svg" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                💡 <strong>Criou seu próprio ícone no Figma ou Illustrator?</strong> Cole abaixo o código da tag <code>&lt;svg&gt;...&lt;/svg&gt;</code> exportada do seu software de design. O editor irá renderizá-lo nativamente com total nitidez vetorial!
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Código SVG Autor:
                </label>
                <textarea
                  rows={6}
                  value={customSvgCode}
                  onChange={(e) => setCustomSvgCode(e.target.value)}
                  placeholder="<svg viewBox='0 0 24 24'> ... </svg>"
                  className="w-full p-3.5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Emojis de Destaque */}
          {activeTab === "emoji" && (
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selecione um Emoji para Inserir no Texto:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-[220px] overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-[#070A10]">
                {EMOJI_LIST.map((item) => (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => setSelectedIconId(item.emoji)}
                    className={`p-3 rounded-2xl text-2xl flex flex-col items-center justify-center gap-1 transition-all border ${
                      selectedIconId === item.emoji
                        ? "bg-emerald-500/20 border-emerald-500 scale-105 ring-2 ring-emerald-500/30"
                        : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title={item.label}
                  >
                    <span>{item.emoji}</span>
                    <span className="text-[9px] font-medium text-slate-500 truncate w-full text-center">
                      {item.label.split("/")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CONTROLES DE PERSONALIZAÇÃO (Tamanho, Cor, Layout) */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-[#1E293B]/80 border border-slate-200 dark:border-slate-700 space-y-4">
            
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Sliders className="w-4 h-4 text-emerald-500" /> Personalizar Ajustes do Ícone:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Ajuste de Tamanho */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tamanho:</label>
                <div className="flex items-center gap-1 bg-white dark:bg-[#0F172A] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {[
                    { label: "16px", val: 16 },
                    { label: "24px", val: 24 },
                    { label: "32px", val: 32 },
                    { label: "48px", val: 48 }
                  ].map((sz) => (
                    <button
                      key={sz.val}
                      type="button"
                      onClick={() => setSelectedSize(sz.val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedSize === sz.val
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ajuste de Cor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Cor do Ícone:</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.value);
                        setUseCustomColorInput(false);
                      }}
                      className={`w-6 h-6 rounded-full transition-transform ${c.bgClass} flex items-center justify-center ${
                        !useCustomColorInput && selectedColor === c.value
                          ? "ring-2 ring-offset-2 ring-emerald-500 scale-110"
                          : "hover:scale-105"
                      }`}
                      title={c.name}
                    >
                      {!useCustomColorInput && selectedColor === c.value && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ajuste de Formato de Inserção */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Estilo no Editor:</label>
                <select
                  value={layoutStyle}
                  onChange={(e) => setLayoutStyle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="inline">Inline no Texto (Seguido)</option>
                  <option value="card">Card em Destaque (Bloco)</option>
                  <option value="list">Marcador de Marcadores (Lista)</option>
                </select>
              </div>

            </div>

            {/* Live Preview Box */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Pré-visualização do Ícone:</span>
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                  style={{ color: finalColorValue }}
                >
                  {activeTab === "library" && (
                    <ActiveIconComponent size={selectedSize} style={{ color: finalColorValue }} />
                  )}
                  {activeTab === "custom-svg" && (
                    <div 
                      dangerouslySetInnerHTML={{ __html: customSvgCode }}
                      style={{ width: selectedSize, height: selectedSize, color: finalColorValue }}
                    />
                  )}
                  {activeTab === "emoji" && (
                    <span style={{ fontSize: `${selectedSize}px` }}>{selectedIconId}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedSize}px • {finalColorValue === "currentColor" ? "Cor do Texto" : finalColorValue}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#070A10]/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmInsert}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 text-xs font-extrabold shadow-lg hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Inserir Ícone no Artigo
          </button>
        </div>

      </div>

    </div>
  );
}
