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
  RotateCcw
} from "lucide-react";
import { InfographicItem } from "@/data/mockPosts";

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

  // State for Infographics
  const [currentInfographicIndex, setCurrentInfographicIndex] = useState(0);

  // Flashcards, Questions, Simulados & Infographics data
  const sampleFlashcards: Flashcard[] = customFlashcards || [];
  const sampleQuestions: Question[] = type === "simulado" ? (customSimulados || []) : (customQuestions || []);
  const sampleInfographics: InfographicItem[] = customInfographics || [];

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    if (currentFlashcardIndex < sampleFlashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else {
      setCurrentFlashcardIndex(0);
    }
  };

  const handlePrevFlashcard = () => {
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

  React.useEffect(() => {
    if (!isOpen || type !== "flashcards") return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, type, currentFlashcardIndex, sampleFlashcards.length]);

  if (!isOpen) return null;

  const exportToAnkiCSV = () => {
    const csvHeader = "Pergunta,Resposta,Categoria\n";
    const csvRows = sampleFlashcards
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
    if (selectedOption === sampleQuestions[currentQuestionIndex].correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 ${isFocusMode && type === "flashcards" ? "p-0" : ""}`}>
      <div className={`relative w-full bg-white dark:bg-[#0B0F17] shadow-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden flex flex-col transition-all duration-300 ${
        isFocusMode && type === "flashcards"
          ? "w-screen h-screen max-w-none max-h-none rounded-none border-none"
          : "max-w-2xl rounded-2xl max-h-[92vh]"
      }`}>
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A]/90 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {type === "flashcards" && (
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />
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
                {type === "questions" && "Questões de Provas Pretéritas"}
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
            sampleFlashcards.length === 0 ? (
              <div className="py-6 sm:py-10 px-4 text-center space-y-3.5 my-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                  <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8" />
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
                
                {/* Gemini Top Header Bar: Progress track + Counters + Focus Mode */}
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80">
                  
                  {/* Segmented Track & Number */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300" 
                        style={{ width: `${((currentFlashcardIndex + 1) / sampleFlashcards.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                      {currentFlashcardIndex + 1}/{sampleFlashcards.length}
                    </span>
                  </div>

                  {/* Red (Wrong) & Green (Correct) Badges */}
                  <div className="flex items-center gap-2 shrink-0">
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
                  className={`relative w-full my-auto cursor-pointer select-none ${
                    isFocusMode
                      ? "max-w-2xl sm:max-w-3xl mx-auto h-[340px] sm:h-[400px]"
                      : "min-h-[220px] sm:min-h-[260px]"
                  }`}
                  style={{ perspective: "1000px" }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div
                    className={`relative w-full h-full rounded-3xl transition-transform duration-600 shadow-2xl ${
                      !isFocusMode ? "min-h-[220px] sm:min-h-[260px]" : ""
                    }`}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
                    }}
                  >
                    {/* FRONT FACE (PERGUNTA) */}
                    <div
                      className="absolute inset-0 w-full h-full p-6 sm:p-10 rounded-3xl bg-[#141B2D] border border-amber-500/25 flex flex-col items-center justify-between text-center shadow-xl hover:border-amber-500/40 transition-colors group"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <BrainCircuit className="w-4 h-4 text-amber-400" /> Memorização Ativa
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px]">
                          Frente / Pergunta
                        </span>
                      </div>

                      <div className="my-auto py-4">
                        <h3 className="text-base sm:text-xl font-bold font-outfit text-white leading-relaxed">
                          {sampleFlashcards[currentFlashcardIndex]?.question}
                        </h3>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 group-hover:text-amber-400 transition-colors">
                        <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin-once" /> Clique no cartão para virar (ou barra de Espaço)
                      </div>
                    </div>

                    {/* BACK FACE (RESPOSTA / GABARITO) */}
                    <div
                      className="absolute inset-0 w-full h-full p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#172136] border border-emerald-500/30 flex flex-col items-center justify-between text-center shadow-2xl"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" /> Gabarito / Resposta
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px]">
                          Verso / Resposta
                        </span>
                      </div>

                      <div className="my-auto py-4">
                        <p className="text-base sm:text-lg font-bold font-outfit text-emerald-100 leading-relaxed">
                          {sampleFlashcards[currentFlashcardIndex]?.answer}
                        </p>
                      </div>

                      <div className="w-full flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkWrong();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Errei (1)
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkCorrect();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Acertei (2)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls & Restart */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handlePrevFlashcard}
                    disabled={currentFlashcardIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
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
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Próximo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )
          )}

          {/* RENDER QUESTIONS OR SIMULADO MODAL */}
          {(type === "questions" || type === "simulado") && (
            sampleQuestions.length === 0 ? (
              <div className="py-6 sm:py-10 px-4 text-center space-y-3.5">
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
            ) : (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span>Questão {currentQuestionIndex + 1} de {sampleQuestions.length}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      type === "simulado"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {type === "simulado" ? "🎯 Questão Inédita (Simulado)" : "🏛️ Prova Pretérita"}
                    </span>
                  </span>
                  <span className={`flex items-center gap-1 font-bold ${type === "simulado" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    <Award className="w-4 h-4" /> Acertos: {score}
                  </span>
                </div>

                {/* Statement */}
                <div className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {sampleQuestions[currentQuestionIndex]?.statement}
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {sampleQuestions[currentQuestionIndex]?.options.map((option, idx) => {
                    let optionStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50";
                    
                    if (selectedOption === idx) {
                      optionStyle = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold";
                    }

                    if (isAnswerSubmitted) {
                      if (idx === sampleQuestions[currentQuestionIndex].correctIndex) {
                        optionStyle = "border-emerald-600 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold";
                      } else if (selectedOption === idx) {
                        optionStyle = "border-red-500 bg-red-100 dark:bg-red-950/40 text-red-900 dark:text-red-200";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start gap-3 ${optionStyle}`}
                      >
                        <span className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 font-bold text-xs">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{option}</span>
                        
                        {isAnswerSubmitted && idx === sampleQuestions[currentQuestionIndex].correctIndex && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {isAnswerSubmitted && selectedOption === idx && idx !== sampleQuestions[currentQuestionIndex].correctIndex && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box when submitted */}
                {isAnswerSubmitted && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-sm animate-in fade-in duration-200">
                    <span className="font-bold flex items-center gap-1 mb-1 text-blue-700 dark:text-blue-300">
                      💡 Comentário do Professor:
                    </span>
                    {sampleQuestions[currentQuestionIndex]?.explanation}
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-end gap-3 pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-all"
                    >
                      Responder Questão
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-semibold text-sm shadow-md transition-all"
                    >
                      {currentQuestionIndex < sampleQuestions.length - 1 ? "Próxima Questão" : "Finalizar Treino"}
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
              <div className="py-6 sm:py-10 px-4 text-center space-y-3.5">
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
                
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Esquema Visual {currentInfographicIndex + 1} de {sampleInfographics.length}</span>
                  <span className="px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase font-bold text-[10px]">
                    {sampleInfographics[currentInfographicIndex]?.type?.replace("_", " ")}
                  </span>
                </div>

                {/* Infographic Main Container */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#0F172A] text-white border border-slate-800 space-y-5 shadow-xl">
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mapa Mental / Resumo Visual
                    </span>
                    <h3 className="text-xl font-bold font-outfit text-white">
                      {sampleInfographics[currentInfographicIndex]?.title}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {sampleInfographics[currentInfographicIndex]?.subtitle}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 leading-relaxed italic">
                    "{sampleInfographics[currentInfographicIndex]?.summary}"
                  </div>

                  {/* Key Points Flow */}
                  {sampleInfographics[currentInfographicIndex]?.points && sampleInfographics[currentInfographicIndex].points.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                        Pontos Chaves de Prova:
                      </h4>

                      <div className="grid grid-cols-1 gap-2.5">
                        {sampleInfographics[currentInfographicIndex]?.points.map((pt, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3 text-xs text-slate-100">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 font-bold text-[10px]">
                              {i + 1}
                            </span>
                            <span className="flex-1 leading-relaxed">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Code/HTML Content if present */}
                  {sampleInfographics[currentInfographicIndex]?.codeContent && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase text-purple-400 tracking-wider">
                        Conteúdo Visual / Código Esquematizado:
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 text-xs font-mono text-slate-100 overflow-x-auto">
                        <div 
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: sampleInfographics[currentInfographicIndex].codeContent || "" }} 
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setCurrentInfographicIndex(Math.max(0, currentInfographicIndex - 1))}
                    disabled={currentInfographicIndex === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" /> Esquema Anterior
                  </button>

                  <button
                    onClick={() => setCurrentInfographicIndex(Math.min(sampleInfographics.length - 1, currentInfographicIndex + 1))}
                    disabled={currentInfographicIndex === sampleInfographics.length - 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
