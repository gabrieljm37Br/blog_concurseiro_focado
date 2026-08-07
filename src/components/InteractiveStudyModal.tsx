"use client";

import React, { useState } from "react";
import { 
  X, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  BrainCircuit, 
  HelpCircle, 
  Award,
  Download,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Check,
  Target,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shuffle,
  SquareStack,
  Building2,
  Calendar,
  Landmark,
  Eye,
  EyeOff,
  MoveHorizontal,
  Info,
  SlidersHorizontal,
  Zap,
  Volume2,
  VolumeX,
  Pause,
  Play,
  FileSpreadsheet
} from "lucide-react";
import { InfographicItem } from "@/data/mockPosts";
import MathRenderer from "@/components/MathRenderer";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface Question {
  id: number;
  statement: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  isSimuladoInedita?: boolean;
  banca?: string;
  ano?: string | number;
  year?: string | number;
  orgao?: string;
  cargo?: string;
}

interface InteractiveStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "flashcards" | "questions" | "infografico" | "simulado";
  articleTitle: string;
  customFlashcards?: Flashcard[];
  customQuestions?: Question[];
  customSimulados?: Question[];
  customInfographics?: InfographicItem[];
}

// Fisher-Yates array shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function InteractiveStudyModal({
  isOpen,
  onClose,
  type,
  articleTitle,
  customFlashcards,
  customQuestions,
  customSimulados,
  customInfographics,
}: InteractiveStudyModalProps) {
  // Active dynamic datasets (allows shuffling without mutating original props)
  const [activeFlashcards, setActiveFlashcards] = useState<Flashcard[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [isFlashcardsShuffled, setIsFlashcardsShuffled] = useState(false);
  const [isQuestionsShuffled, setIsQuestionsShuffled] = useState(false);

  // State for Flashcards (Gemini 3D Style & Immersive Mode)
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // State for Questions & Simulado
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // State for Infographics (Fase 1, 2 e 3: Teste de Memória, Banca, Hotspots, Split Slider, TTS Áudio & Anki Export)
  const [currentInfographicIndex, setCurrentInfographicIndex] = useState(0);
  const [isMemoryTestMode, setIsMemoryTestMode] = useState(false);
  const [selectedBancaFilter, setSelectedBancaFilter] = useState<"todas" | "cebraspe" | "fgv" | "fcc" | "vunesp">("todas");
  const [revealedPoints, setRevealedPoints] = useState<Record<number, boolean>>({});
  const [activeHotspotId, setActiveHotspotId] = useState<string | number | null>(null);
  const [splitSliderPos, setSplitSliderPos] = useState(50); // percentage 0-100
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);

  // Default Infographics Fallback for Demo (Mental Map, Hotspots, Split Slider, Code HTML)
  const DEFAULT_INFOGRAPHICS: InfographicItem[] = [
    {
      id: 101,
      title: "Anatomia do Ato Administrativo (Art. 2º da Lei 4.717/65)",
      subtitle: "Passe o cursor ou toque nos pontos pulsantes para explorar os 5 elementos de validade (COFIFOMOB)",
      summary: "Esquema gráfico dos 5 elementos de formação do Ato Administrativo: Competência, Finalidade, Forma, Motivo e Objeto.",
      points: [
        "Competência e Forma são elementos que admitem CONVALIDAÇÃO (regra geral).",
        "Finalidade e Motivo NUNCA admitem convalidação se houver vício insanável.",
        "Objeto deve ser lícito, possível, determinado e moral."
      ],
      type: "hotspots_interativos",
      hotspots: [
        {
          id: "hs-1",
          x: 20,
          y: 35,
          title: "1. Competência (Sujeito)",
          description: "Poder legal conferido ao agente público para praticar o ato. É vinculado, irrenunciável e imprescritível.",
          bancaTip: "CEBRASPE: Vício de competência por excesso de poder admite convalidação se não for de competência exclusiva.",
          badge: "Convalidável"
        },
        {
          id: "hs-2",
          x: 48,
          y: 22,
          title: "2. Finalidade",
          description: "Objetivo de interesse público a ser alcançado. O desvio de finalidade torna o ato nulo de pleno direito.",
          bancaTip: "FGV: Desvio de poder/finalidade é vício insanável. Jamais admite convalidação!",
          badge: "Vício Insanável"
        },
        {
          id: "hs-3",
          x: 80,
          y: 35,
          title: "3. Forma",
          description: "Modo de exteriorização da vontade da Administração (escrita, símbolos ou ordens verbais).",
          bancaTip: "VUNESP: Vício de forma em ato não solene admite convalidação por ratificação formal.",
          badge: "Convalidável"
        },
        {
          id: "hs-4",
          x: 35,
          y: 72,
          title: "4. Motivo",
          description: "Situação de fato e de direito que autoriza ou determina a prática do ato administrativo.",
          bancaTip: "FCC (Teoria dos Motivos Determinantes): Se o motivo alegado for falso, o ato é nulo!",
          badge: "Teoria dos Motivos"
        },
        {
          id: "hs-5",
          x: 65,
          y: 72,
          title: "5. Objeto (Conteúdo)",
          description: "Efeito jurídico imediato que o ato produz no ordenamento (criação, alteração ou extinção de direitos).",
          bancaTip: "CEBRASPE: Objeto juridicamente impossível gera nulidade absoluta e insanável.",
          badge: "Efeito Imediato"
        }
      ]
    },
    {
      id: 102,
      title: "Comparativo: Lei 8.666/93 (Antiga) vs Lei 14.133/21 (Nova Lei de Licitações)",
      subtitle: "Arraste o slider central para comparar lado a lado as mudanças essenciais exigidas em provas",
      summary: "Quadro comparativo dinâmico das modalidades, ritos processuais e extinções de leis.",
      points: [
        "Pregão e Concorrência agora utilizam o mesmo procedimento comum na Lei 14.133/21.",
        "As modalidades Convite e Tomada de Preços foram EXTINTAS na Nova Lei.",
        "A modalidade Diálogo Competitivo foi INCLUÍDA exclusivamente na Lei 14.133/21."
      ],
      type: "comparativo_antes_depois",
      splitSlider: {
        beforeTitle: "📜 Regime Antigo (Lei 8.666/93)",
        beforeSubtitle: "Procedimento burocrático e regras revogadas",
        beforeContent: "• **Modalidades:** Convite, Tomada de Preços, Concorrência, Leilão, Concurso e Pregão.\n• **Fase Inicial:** Habilitação documental realizada ANTES da abertura de propostas.\n• **Publicidade:** Publicação em jornais de grande circulação impressos e diários oficiais.",
        afterTitle: "🚀 Nova Lei de Licitações (Lei 14.133/21)",
        afterSubtitle: "Marco moderno com inversão de fases e hub digital",
        afterContent: "• **Modalidades:** Pregão, Concorrência, Concurso, Leilão e DIÁLOGO COMPETITIVO (Convite e Tomada de Preços EXTINTOS!).\n• **Inversão de Fases:** Julgamento de propostas ANTES da Habilitação (Regra Geral).\n• **Hub Digital:** Criação do Portal Nacional de Contratações Públicas (PNCP).",
        bancaHighlight: "FGV e CEBRASPE adoram cobrar a extinção do Convite/Tomada de Preços e a criação do Diálogo Competitivo!"
      }
    }
  ];

  const sampleInfographics: InfographicItem[] = Array.isArray(customInfographics) 
    ? customInfographics 
    : DEFAULT_INFOGRAPHICS;

  // Reset ALL state & load initial datasets whenever modal opens, type changes, or articleTitle changes
  React.useEffect(() => {
    if (isOpen) {
      const fc = customFlashcards || [];
      const q = type === "simulado" ? (customSimulados || []) : (customQuestions || []);

      setActiveFlashcards(fc);
      setActiveQuestions(q);
      setIsFlashcardsShuffled(false);
      setIsQuestionsShuffled(false);

      setCurrentFlashcardIndex(0);
      setIsFlipped(false);
      setWrongCount(0);
      setCorrectCount(0);

      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setScore(0);
      setIsQuizCompleted(false);

      setCurrentInfographicIndex(0);
      setIsMemoryTestMode(false);
      setSelectedBancaFilter("todas");
      setRevealedPoints({});
      setActiveHotspotId(null);
      setSplitSliderPos(50);
      setIsSpeaking(false);
      setIsAudioPaused(false);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, type, articleTitle, customFlashcards, customQuestions, customSimulados]);

  // TTS (Web Speech API) handlers
  const handleToggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("A síntese de voz não é suportada neste navegador.");
      return;
    }

    if (isSpeaking) {
      if (isAudioPaused) {
        window.speechSynthesis.resume();
        setIsAudioPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsAudioPaused(true);
      }
    } else {
      window.speechSynthesis.cancel();
      const info = sampleInfographics[currentInfographicIndex] || sampleInfographics[0];
      if (!info) return;

      let speechText = `Infográfico: ${info.title}. Subtítulo: ${info.subtitle}. Resumo: ${info.summary}. `;
      if (info.points && info.points.length > 0) {
        speechText += "Pontos chaves de prova: " + info.points.join(". ") + ". ";
      }
      if (info.hotspots && info.hotspots.length > 0) {
        speechText += "Hotspots interativos: " + info.hotspots.map(h => `${h.title}: ${h.description}. Dica da banca: ${h.bancaTip || ''}`).join(". ") + ". ";
      }
      if (info.splitSlider) {
        speechText += `Comparativo. ${info.splitSlider.beforeTitle}: ${info.splitSlider.beforeContent}. ${info.splitSlider.afterTitle}: ${info.splitSlider.afterContent}. Dica de prova: ${info.splitSlider.bancaHighlight || ''}`;
      }

      const cleanText = speechText.replace(/\*/g, "").replace(/#/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsAudioPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsAudioPaused(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsAudioPaused(false);
    }
  };

  const handleStopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsAudioPaused(false);
  };

  // Anki CSV Deck Exporter handler
  const handleExportAnki = () => {
    const info = sampleInfographics[currentInfographicIndex] || sampleInfographics[0];
    if (!info) return;

    let csvRows: string[] = [];
    csvRows.push('"Frente (Pergunta/Conceito)","Verso (Gabarito/Dica de Prova)"');

    // Item 1: Summary Card
    const summaryFront = `[${articleTitle || "Concurso Público"}] - ${info.title}`;
    const summaryBack = `${info.summary}<br><br><b>Subtítulo:</b> ${info.subtitle}`;
    csvRows.push(`"${summaryFront.replace(/"/g, '""')}","${summaryBack.replace(/"/g, '""')}"`);

    // Key Points
    if (info.points && info.points.length > 0) {
      info.points.forEach((pt, idx) => {
        const ptFront = `[${info.title}] - Ponto Chave de Prova ${idx + 1}`;
        const ptBack = `${pt}<br><br><b>Foco Banca:</b> ${selectedBancaFilter !== "todas" ? selectedBancaFilter.toUpperCase() : "Geral"}`;
        csvRows.push(`"${ptFront.replace(/"/g, '""')}","${ptBack.replace(/"/g, '""')}"`);
      });
    }

    // Hotspots
    if (info.hotspots && info.hotspots.length > 0) {
      info.hotspots.forEach((hs) => {
        const hsFront = `[${info.title}] - ${hs.title}`;
        const hsBack = `${hs.description}<br><br>💡 <b>Dica de Prova:</b> ${hs.bancaTip || 'Atenção às pegadinhas formais!'}`;
        csvRows.push(`"${hsFront.replace(/"/g, '""')}","${hsBack.replace(/"/g, '""')}"`);
      });
    }

    // Split Slider
    if (info.splitSlider) {
      const splitFront = `[${info.title}] - Comparativo: ${info.splitSlider.beforeTitle} vs ${info.splitSlider.afterTitle}`;
      const splitBack = `<b>${info.splitSlider.beforeTitle}:</b><br>${info.splitSlider.beforeContent.replace(/\n/g, '<br>')}<br><br><b>${info.splitSlider.afterTitle}:</b><br>${info.splitSlider.afterContent.replace(/\n/g, '<br>')}<br><br>📌 <b>Pegadinha:</b> ${info.splitSlider.bancaHighlight || ''}`;
      csvRows.push(`"${splitFront.replace(/"/g, '""')}","${splitBack.replace(/"/g, '""')}"`);
    }

    const csvString = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = info.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.href = url;
    link.download = `anki_deck_${safeTitle}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler to shuffle Flashcards
  const handleShuffleFlashcards = () => {
    if (activeFlashcards.length === 0) return;
    setActiveFlashcards(shuffleArray(activeFlashcards));
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    setWrongCount(0);
    setCorrectCount(0);
    setIsFlashcardsShuffled(true);
  };

  // Handler to shuffle Questions / Simulado
  const handleShuffleQuestions = () => {
    if (activeQuestions.length === 0) return;
    setActiveQuestions(shuffleArray(activeQuestions));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
    setIsQuestionsShuffled(true);
  };

  const handleNextFlashcard = () => {
    if (activeFlashcards.length === 0) return;
    setIsFlipped(false);
    if (currentFlashcardIndex < activeFlashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else {
      setCurrentFlashcardIndex(0);
    }
  };

  const handlePrevFlashcard = () => {
    if (activeFlashcards.length === 0) return;
    setIsFlipped(false);
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
    }
  };

  const handleMarkWrong = () => {
    setWrongCount(prev => prev + 1);
    handleNextFlashcard();
  };

  const handleMarkCorrect = () => {
    setCorrectCount(prev => prev + 1);
    handleNextFlashcard();
  };

  const handleResetFlashcardStats = () => {
    setWrongCount(0);
    setCorrectCount(0);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when typing in inputs/textareas
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (type === "flashcards" && activeFlashcards.length > 0) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNextFlashcard();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevFlashcard();
        } else if (e.key === "1") {
          e.preventDefault();
          handleMarkWrong();
        } else if (e.key === "2") {
          e.preventDefault();
          handleMarkCorrect();
        }
      } else if ((type === "questions" || type === "simulado") && activeQuestions.length > 0 && !isQuizCompleted) {
        if (["1", "2", "3", "4", "5", "a", "A", "b", "B", "c", "C", "d", "D", "e", "E"].includes(e.key)) {
          let idx = -1;
          if (["1", "a", "A"].includes(e.key)) idx = 0;
          else if (["2", "b", "B"].includes(e.key)) idx = 1;
          else if (["3", "c", "C"].includes(e.key)) idx = 2;
          else if (["4", "d", "D"].includes(e.key)) idx = 3;
          else if (["5", "e", "E"].includes(e.key)) idx = 4;

          if (idx >= 0 && idx < (activeQuestions[currentQuestionIndex]?.options.length || 0)) {
            e.preventDefault();
            handleSelectOption(idx);
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (!isAnswerSubmitted && selectedOption !== null) {
            handleSubmitAnswer();
          } else if (isAnswerSubmitted) {
            handleNextQuestion();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, type, currentFlashcardIndex, activeFlashcards.length, currentQuestionIndex, activeQuestions, selectedOption, isAnswerSubmitted, isQuizCompleted]);

  if (!isOpen) return null;

  const exportToAnkiCSV = () => {
    const csvHeader = "Pergunta,Resposta,Categoria\n";
    const csvRows = activeFlashcards
      .map(card => `"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}","${card.category}"`)
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ankideck_${articleTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === activeQuestions[currentQuestionIndex].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 ${isFocusMode ? "p-0" : ""}`}>
      <div className={`relative w-full bg-white dark:bg-[#0B0F17] shadow-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden flex flex-col transition-all duration-300 ${
        isFocusMode
          ? "w-screen h-screen max-w-none max-h-none rounded-none border-none"
          : "max-w-2xl md:max-w-4xl lg:max-w-5xl rounded-2xl max-h-[92vh]"
      }`}>
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A]/90 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {type === "flashcards" && (
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <SquareStack className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            {type === "questions" && (
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            {type === "simulado" && (
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            {type === "infografico" && (
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white capitalize truncate">
                {type === "flashcards" && "Flashcards de Memorização Ativa (Estilo Gemini)"}
                {type === "questions" && "Questões de Provas"}
                {type === "simulado" && "Simulado de Questões Inéditas"}
                {type === "infografico" && "Infográfico & Mapa Mental do Artigo"}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {articleTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col">
          
          {/* RENDER FLASHCARDS MODAL (Gemini 3D Flip Experience) */}
          {type === "flashcards" && (
            activeFlashcards.length === 0 ? (
              <div className="py-6 sm:py-10 px-4 text-center space-y-3.5 my-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                  <SquareStack className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-outfit">
                    Nenhum Flashcard Cadastrado
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Este artigo ainda não possui flashcards de memorização ativa cadastrados pelo autor.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between space-y-4 py-1">
                
                {/* Gemini Top Header Bar: Progress track + Counters + Shuffle + Focus Mode */}
                <div className={`flex items-center justify-between gap-3 text-xs font-semibold text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80 w-full ${
                  isFocusMode ? "max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto" : ""
                }`}>
                  
                  {/* Segmented Track & Number */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300" 
                        style={{ width: `${activeFlashcards.length > 0 ? ((currentFlashcardIndex + 1) / activeFlashcards.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                      {currentFlashcardIndex + 1}/{activeFlashcards.length}
                    </span>
                  </div>

                  {/* Badges + Shuffle Button + Focus Mode */}
                  <div className="flex items-center gap-2 shrink-0">
                    
                    {/* Shuffle Button */}
                    <button
                      onClick={handleShuffleFlashcards}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                        isFlashcardsShuffled
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm"
                          : "bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-500/30"
                      }`}
                      title="Embaralhar ordem dos Flashcards"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isFlashcardsShuffled ? "Embaralhado" : "Embaralhar"}</span>
                    </button>

                    <button
                      onClick={handleMarkWrong}
                      className="px-2.5 py-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                      title="Marcar como Errei / Revisar (Atalho: Tecla 1)"
                    >
                      <X className="w-3.5 h-3.5" /> <span>{wrongCount}</span>
                    </button>

                    <button
                      onClick={handleMarkCorrect}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                      title="Marcar como Acertei / Dominado (Atalho: Tecla 2)"
                    >
                      <Check className="w-3.5 h-3.5" /> <span>{correctCount}</span>
                    </button>

                    <button
                      onClick={() => setIsFocusMode(!isFocusMode)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title={isFocusMode ? "Sair da Tela Cheia" : "Modo Imersivo (Tela Cheia)"}
                    >
                      {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={exportToAnkiCSV}
                      className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer hidden sm:flex"
                      title="Baixar Deck Anki (.csv)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Gemini 3D Flip Card Component Stage */}
                <div
                  className={`relative w-full my-auto cursor-pointer select-none max-w-2xl sm:max-w-3xl mx-auto ${
                    isFocusMode
                      ? "h-[340px] sm:h-[400px] md:h-[460px]"
                      : "h-[320px] sm:h-[380px] md:h-[420px]"
                  }`}
                  style={{ perspective: "1000px" }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div
                    className="relative w-full h-full rounded-3xl transition-transform duration-600 shadow-2xl"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
                    }}
                  >
                    {/* FRONT FACE (PERGUNTA) */}
                    <div
                      className="absolute inset-0 w-full h-full p-6 sm:p-10 md:p-12 rounded-3xl bg-[#141B2D] border border-amber-500/25 flex flex-col items-center justify-between text-center shadow-xl hover:border-amber-500/40 transition-colors group"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <SquareStack className="w-4 h-4 text-amber-400" /> Memorização Ativa
                          {isFlashcardsShuffled && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold normal-case">
                              ⚡ Aleatório
                            </span>
                          )}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold">
                          Frente / Pergunta
                        </span>
                      </div>

                      <div className="my-auto py-4 max-w-3xl">
                        <h3 className="text-base sm:text-xl md:text-2xl font-bold font-outfit text-white leading-relaxed">
                          <MathRenderer content={activeFlashcards[currentFlashcardIndex]?.question || ""} />
                        </h3>
                      </div>

                      <div className="text-[11px] sm:text-xs font-semibold text-slate-400 flex items-center gap-1.5 group-hover:text-amber-400 transition-colors">
                        <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin-once" /> Clique no cartão para virar (ou barra de Espaço)
                      </div>
                    </div>

                    {/* BACK FACE (RESPOSTA / GABARITO) */}
                    <div
                      className="absolute inset-0 w-full h-full p-6 sm:p-10 md:p-12 rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#172136] border border-emerald-500/30 flex flex-col items-center justify-between text-center shadow-2xl"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-black uppercase tracking-widest text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" /> Gabarito / Resposta
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold">
                          Verso / Resposta
                        </span>
                      </div>

                      <div className="my-auto py-4 max-w-3xl">
                        <div className="text-base sm:text-lg md:text-xl font-bold font-outfit text-emerald-100 leading-relaxed">
                          <MathRenderer content={activeFlashcards[currentFlashcardIndex]?.answer || ""} />
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkWrong();
                          }}
                          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Errei
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkCorrect();
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Acertei
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls & Restart */}
                <div className={`flex items-center justify-between pt-1 w-full ${
                  isFocusMode ? "max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto" : ""
                }`}>
                  <button
                    onClick={handlePrevFlashcard}
                    disabled={currentFlashcardIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Anterior
                  </button>

                  <button
                    onClick={handleResetFlashcardStats}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Reiniciar estatísticas da sessão"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNextFlashcard}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Próximo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )
          )}

          {/* RENDER QUESTIONS OR SIMULADO MODAL */}
          {(type === "questions" || type === "simulado") && (
            activeQuestions.length === 0 ? (
              <div className="py-6 sm:py-10 px-4 text-center space-y-3.5 my-auto">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto border ${
                  type === "simulado"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}>
                  {type === "simulado" ? <Target className="w-6 h-6 sm:w-8 sm:h-8" /> : <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8" />}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-outfit">
                    {type === "simulado" ? "Nenhum Simulado Cadastrado" : "Nenhuma Questão Cadastrada"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {type === "simulado"
                      ? "Este artigo ainda não possui questões inéditas de simulado cadastradas pelo autor."
                      : "Este artigo ainda não possui questões práticas de concursos anteriores cadastradas pelo autor."}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            ) : isQuizCompleted ? (
              /* Quiz / Simulado Finished Score Summary Screen */
              <div className="py-8 px-4 text-center space-y-5 my-auto animate-in fade-in duration-300">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto border shadow-lg ${
                  score / activeQuestions.length >= 0.7
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : score / activeQuestions.length >= 0.5
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    : "bg-red-500/10 text-red-500 border-red-500/30"
                }`}>
                  <Award className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {type === "simulado" ? "Desempenho no Simulado" : "Desempenho nas Questões"}
                  </span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xl sm:text-2xl font-outfit">
                    {score / activeQuestions.length >= 0.7
                      ? "🎉 Excelente Resultado!"
                      : score / activeQuestions.length >= 0.5
                      ? "👍 Bom Treino!"
                      : "📚 Continue Revisando!"}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Você acertou <strong className="text-slate-900 dark:text-white font-black">{score}</strong> de <strong className="text-slate-900 dark:text-white font-black">{activeQuestions.length}</strong> questões ({Math.round((score / activeQuestions.length) * 100)}% de aproveitamento).
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRestartQuiz}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Refazer Treino
                  </button>

                  <button
                    onClick={handleShuffleQuestions}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Shuffle className="w-4 h-4" /> Refazer em Ordem Aleatória
                  </button>

                  <button
                    onClick={onClose}
                    className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer ${
                      type === "simulado"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    Concluir e Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className={`space-y-5 ${isFocusMode ? "max-w-3xl md:max-w-4xl mx-auto w-full" : ""}`}>
                
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span>Questão {currentQuestionIndex + 1} de {activeQuestions.length}</span>
                    {type === "simulado" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        🎯 Questão Inédita (Simulado)
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Shuffle Button */}
                    <button
                      onClick={handleShuffleQuestions}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                        isQuestionsShuffled
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                      title="Embaralhar ordem das questões"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isQuestionsShuffled ? "Ordem Aleatória" : "Embaralhar"}</span>
                    </button>

                    <span className={`flex items-center gap-1 font-bold ${type === "simulado" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      <Award className="w-4 h-4" /> Acertos: {score}
                    </span>

                    <button
                      onClick={() => setIsFocusMode(!isFocusMode)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title={isFocusMode ? "Sair da Tela Cheia" : "Modo Imersivo (Tela Cheia)"}
                    >
                      {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Question Metadata Badges: Banca, Ano, Órgão */}
                {(() => {
                  const currentQ = activeQuestions[currentQuestionIndex];
                  const bancaVal = currentQ?.banca || "Cebraspe";
                  const anoVal = currentQ?.ano || currentQ?.year || "2026";
                  const orgaoVal = currentQ?.orgao || "Concurso Público";

                  return (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs font-bold">
                        <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Banca:</span> {bancaVal}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Ano:</span> {anoVal}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs font-bold">
                        <Landmark className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Órgão:</span> {orgaoVal}
                      </span>
                    </div>
                  );
                })()}

                {/* Statement */}
                <div className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <MathRenderer content={activeQuestions[currentQuestionIndex]?.statement || ""} />
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {activeQuestions[currentQuestionIndex]?.options.map((option, idx) => {
                    let optionStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/50";
                    let badgeStyle = "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300";
                    
                    if (selectedOption === idx) {
                      optionStyle = "border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold ring-1 ring-amber-500/50";
                      badgeStyle = "border-amber-500 bg-amber-500 text-slate-950 font-black";
                    }

                    if (isAnswerSubmitted) {
                      if (idx === activeQuestions[currentQuestionIndex].correctIndex) {
                        optionStyle = "border-emerald-600 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold";
                        badgeStyle = "border-emerald-500 bg-emerald-600 text-white font-black";
                      } else if (selectedOption === idx) {
                        optionStyle = "border-red-500 bg-red-100 dark:bg-red-950/40 text-red-900 dark:text-red-200";
                        badgeStyle = "border-red-500 bg-red-500 text-white font-black";
                      } else {
                        optionStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${badgeStyle}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <MathRenderer content={option} inline className="flex-1" />
                        
                        {isAnswerSubmitted && idx === activeQuestions[currentQuestionIndex].correctIndex && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {isAnswerSubmitted && selectedOption === idx && idx !== activeQuestions[currentQuestionIndex].correctIndex && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box when submitted (only if explanation exists) */}
                {isAnswerSubmitted && activeQuestions[currentQuestionIndex]?.explanation && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-sm animate-in fade-in duration-200">
                    <span className="font-bold flex items-center gap-1 mb-1 text-blue-700 dark:text-blue-300">
                      💡 Comentário do Professor:
                    </span>
                    <MathRenderer content={activeQuestions[currentQuestionIndex]?.explanation || ""} />
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-end gap-3 pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                    >
                      Responder Questão
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-semibold text-sm shadow-md transition-all cursor-pointer"
                    >
                      {currentQuestionIndex < activeQuestions.length - 1 ? "Próxima Questão" : "Finalizar Treino"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            )
          )}

          {/* RENDER INFOGRAFICO MODAL */}
          {type === "infografico" && (
            sampleInfographics.length === 0 ? (
              <div className="py-6 sm:py-10 px-4 text-center space-y-3.5 my-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto border border-purple-500/20">
                  <Layers className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-outfit">
                    Nenhum Infográfico Cadastrado
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Este artigo ainda não possui mapas mentais ou esquemas visuais cadastrados pelo autor.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* TOOLBAR DE ESTUDO ATIVO (Exibida apenas para Flashcards, Questões e Simulados) */}
                {type !== "infografico" && (
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#0F172A]/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Botão Alternador do Modo Teste de Memória (Active Recall) */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMemoryTestMode(!isMemoryTestMode);
                          setRevealedPoints({});
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                          isMemoryTestMode
                            ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-amber-500"
                        }`}
                        title={isMemoryTestMode ? "Modo Teste de Memória ativo. Clique para retornar ao modo leitura." : "Ocultar pontos-chave para testar sua memória antes de revelar"}
                      >
                        {isMemoryTestMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-amber-500" />}
                        <span>{isMemoryTestMode ? "🧠 Teste Ativo" : "🧠 Teste Memória"}</span>
                      </button>

                      {/* Botão de Narração em Áudio por Voz (TTS - Text to Speech) */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleToggleSpeak}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                            isSpeaking
                              ? isAudioPaused
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-emerald-600 text-white border-emerald-500 shadow-md animate-pulse"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500"
                          }`}
                          title="Ouvir a narração em áudio por voz deste infográfico"
                        >
                          {isSpeaking ? (
                            isAudioPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          <span>{isSpeaking ? (isAudioPaused ? "Continuar Áudio" : "Pausar Áudio") : "🔊 Narração Áudio"}</span>
                        </button>

                        {isSpeaking && (
                          <button
                            type="button"
                            onClick={handleStopAudio}
                            className="p-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all cursor-pointer"
                            title="Parar áudio"
                          >
                            <VolumeX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Botão Exportador de Baralho para o ANKI (.CSV) */}
                      <button
                        type="button"
                        onClick={handleExportAnki}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer border border-purple-500"
                        title="Gerar e baixar arquivo CSV formatado para importação direta no ANKI"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-purple-200" />
                        <span>Exportar p/ Anki (.csv)</span>
                      </button>

                      {/* Seletor de Filtro por Banca Examinadora */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase text-slate-400 px-1.5 hidden lg:inline">Banca:</span>
                        {(["todas", "cebraspe", "fgv", "fcc", "vunesp"] as const).map((banca) => (
                          <button
                            key={banca}
                            type="button"
                            onClick={() => setSelectedBancaFilter(banca)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                              selectedBancaFilter === banca
                                ? banca === "fgv" ? "bg-amber-500 text-slate-950 shadow-xs"
                                  : banca === "cebraspe" ? "bg-emerald-600 text-white shadow-xs"
                                  : banca === "fcc" ? "bg-purple-600 text-white shadow-xs"
                                  : banca === "vunesp" ? "bg-blue-600 text-white shadow-xs"
                                  : "bg-slate-700 text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            {banca}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {sampleInfographics.length > 1 && (
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Infográfico {Math.min(currentInfographicIndex + 1, sampleInfographics.length)} de {sampleInfographics.length}</span>
                  </div>
                )}

                {/* Infographic Main Container */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#0F172A] text-white border border-slate-800 space-y-6 shadow-xl text-center">
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Infográfico do Artigo
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold font-outfit text-white">
                      {(sampleInfographics[currentInfographicIndex] || sampleInfographics[0])?.title}
                    </h3>
                    {(sampleInfographics[currentInfographicIndex] || sampleInfographics[0])?.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-300">
                        {(sampleInfographics[currentInfographicIndex] || sampleInfographics[0])?.subtitle}
                      </p>
                    )}
                  </div>

                  {(sampleInfographics[currentInfographicIndex] || sampleInfographics[0])?.summary && (
                    <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 leading-relaxed italic max-w-xl mx-auto">
                      "{(sampleInfographics[currentInfographicIndex] || sampleInfographics[0])?.summary}"
                    </div>
                  )}

                  {/* Botão de Destaque com Alta Visibilidade em Ambos os Modos */}
                  {(() => {
                    const currentInfo = sampleInfographics[currentInfographicIndex] || sampleInfographics[0];
                    const targetLink = currentInfo?.url || (currentInfo?.codeContent && currentInfo?.id ? `/api/infograficos/${currentInfo.id}` : null);
                    if (!targetLink) return null;
                    return (
                      <div className="pt-3 flex flex-col items-center justify-center gap-3">
                        <a
                          href={targetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/30 hover:scale-[1.03] active:scale-[0.97] inline-flex items-center justify-center gap-2 cursor-pointer border border-emerald-300"
                        >
                          <Sparkles className="w-5 h-5 text-slate-950" />
                          <span>Abrir Infográfico em Tela Cheia ↗</span>
                        </a>
                        <p className="text-xs text-slate-400">
                          Acesse a visualização completa e interativa em uma nova guia.
                        </p>
                      </div>
                    );
                  })()}

                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setCurrentInfographicIndex(Math.max(0, currentInfographicIndex - 1))}
                    disabled={currentInfographicIndex === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Esquema Anterior
                  </button>

                  <button
                    onClick={() => setCurrentInfographicIndex(Math.min(sampleInfographics.length - 1, currentInfographicIndex + 1))}
                    disabled={currentInfographicIndex === sampleInfographics.length - 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Próximo Esquema <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
