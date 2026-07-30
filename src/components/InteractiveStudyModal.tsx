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
  Check
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
}

interface InteractiveStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "flashcards" | "questions" | "infografico" | "simulado";
  articleTitle: string;
  customFlashcards?: Flashcard[];
  customQuestions?: Question[];
  customInfographics?: InfographicItem[];
}

export default function InteractiveStudyModal({
  isOpen,
  onClose,
  type,
  articleTitle,
  customFlashcards,
  customQuestions,
  customInfographics,
}: InteractiveStudyModalProps) {
  // State for Flashcards
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // State for Questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // State for Infographics
  const [currentInfographicIndex, setCurrentInfographicIndex] = useState(0);

  if (!isOpen) return null;

  // Fallback Flashcards
  const sampleFlashcards: Flashcard[] = customFlashcards && customFlashcards.length > 0 ? customFlashcards : [
    {
      id: 1,
      question: "Qual tribunal é competente para julgar a ADI (Ação Direta de Inconstitucionalidade) de lei federal?",
      answer: "O STF (Supremo Tribunal Federal), atuando como guardião da Constituição (Art. 102, I, 'a' da CF/88).",
      category: "Direito Constitucional"
    },
    {
      id: 2,
      question: "Os legitimados especiais para proposição de ADI no STF precisam demonstrar pertinência temática?",
      answer: "SIM. Os legitimados especiais (ex: Confederação Sindical, Entidade de Classe Nacional, Governadores) precisam demonstrar o interesse direto na matéria.",
      category: "Controle de Constitucionalidade"
    },
    {
      id: 3,
      question: "Qual o efeito da decisão no controle concentrado de constitucionalidade?",
      answer: "Efeitos ERGA OMNES (contra todos) e VINCULANTE para os demais órgãos do Poder Judiciário e Administração Pública.",
      category: "Direito Constitucional"
    }
  ];

  // Fallback Questions
  const sampleQuestions: Question[] = customQuestions && customQuestions.length > 0 ? customQuestions : [
    {
      id: 1,
      statement: "No que concerne ao Controle de Constitucionalidade das Leis no direito brasileiro, assinale a opção CORRETA:",
      options: [
        "O controle difuso pode ser exercido apenas pelo Supremo Tribunal Federal.",
        "Qualquer juiz ou tribunal de 1ª ou 2ª instância pode declarar a inconstitucionalidade de lei no caso concreto (Controle Difuso).",
        "As decisões em ADI possuem efeito apenas inter partes e não vinculante.",
        "Governador de Estado é considerado legitimado universal, dispensando pertinência temática."
      ],
      correctIndex: 1,
      explanation: "No sistema brasileiro, o controle difuso de constitucionalidade é descentralizado: qualquer juiz ou tribunal tem competência para afastar a aplicação de lei inconstitucional no caso concreto trazido às suas mãos."
    },
    {
      id: 2,
      statement: "A respeito dos efeitos do julgamento de procedente de Ação Direta de Inconstitucionalidade pelo STF, é correto afirmar que:",
      options: [
        "Produz efeitos ex nunc como regra geral, salvo modulação.",
        "Produz efeitos ex tunc (retroativos) e eficácia erga omnes como regra geral.",
        "Não vincula a Administração Pública direta.",
        "Depende de homologação prévia pelo Senado Federal em todos os casos."
      ],
      correctIndex: 1,
      explanation: "A regra geral do julgamento de inconstitucionalidade pelo STF é a nulidade ab initio da norma (efeitos ex tunc, retroativos), com eficácia erga omnes e efeito vinculante."
    }
  ];

  // Fallback Infographics
  const sampleInfographics: InfographicItem[] = customInfographics && customInfographics.length > 0 ? customInfographics : [
    {
      id: 1,
      title: "Esquema Visual: Legitimados da ADI (Art. 103 CF/88)",
      subtitle: "Divisão entre Legitimados Universais e Especiais",
      summary: "Legitimados Universais não precisam de pertinência temática. Legitimados Especiais DEVEM comprovar vínculo direto com a matéria da lei impugnada.",
      points: [
        "Legitimados Universais (3 P's e 3 Mesas): Presidente da República, PGR, Conselho Federal da OAB, Mesa do Senado, Mesa da Câmara, Partidos Políticos com representação no Congresso.",
        "Legitimados Especiais (Exigem Pertinência): Governadores de Estado/DF, Mesas das Assembleias Legislativas, Confederação Sindical ou Entidade de Classe de Âmbito Nacional."
      ],
      type: "mapa_mental"
    },
    {
      id: 2,
      title: "Fluxo Visual: Efeitos da Decisão de Inconstitucionalidade no STF",
      subtitle: "Regra geral vs. Modulação de Efeitos",
      summary: "Por padrão a lei inconstitucional é nula desde o nascimento (Ex Tunc). Porém o STF pode modular efeitos por razões de segurança jurídica.",
      points: [
        "Efeito Temporal Padrão: EX TUNC (Retroativo desde a edição da lei)",
        "Efeito Subjetivo: ERGA OMNES (Atinge a todos no território nacional)",
        "Efeito Vinculante: Obriga Poder Judiciário e Adm. Pública (não vincula o Poder Legislativo no ato de legislar)"
      ],
      type: "tabela_comparativa"
    }
  ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            {type === "flashcards" && (
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <BrainCircuit className="w-5 h-5" />
              </div>
            )}
            {type === "questions" && (
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <HelpCircle className="w-5 h-5" />
              </div>
            )}
            {type === "infografico" && (
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Layers className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                {type === "flashcards" && "Flashcards de Memorização Ativa"}
                {type === "questions" && "Questões Práticas de Fixação"}
                {type === "infografico" && "Infográfico & Mapa Mental do Artigo"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                {articleTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* RENDER FLASHCARDS MODAL */}
          {type === "flashcards" && (
            <div className="space-y-6">
              
              {/* Progress & Anki Export Header */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Cartão {currentFlashcardIndex + 1} de {sampleFlashcards.length}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    {sampleFlashcards[currentFlashcardIndex].category}
                  </span>

                  <button
                    onClick={exportToAnkiCSV}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold transition-all text-[11px]"
                    title="Baixar cartões formatados em CSV para o Anki"
                  >
                    <Download className="w-3 h-3 text-amber-500" /> Anki (.csv)
                  </button>
                </div>
              </div>

              {/* The Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[220px] p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500/50 transition-all group"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                  {isFlipped ? "Resposta (Clique para Virar)" : "Frente (Clique para Revelar a Resposta)"}
                </span>

                {!isFlipped ? (
                  <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
                    "{sampleFlashcards[currentFlashcardIndex].question}"
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in zoom-in-95 duration-200">
                    {sampleFlashcards[currentFlashcardIndex].answer}
                  </p>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevFlashcard}
                  disabled={currentFlashcardIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNextFlashcard}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-200"
                  >
                    Difícil
                  </button>
                  <button
                    onClick={handleNextFlashcard}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                  >
                    Médio
                  </button>
                  <button
                    onClick={handleNextFlashcard}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                  >
                    Fácil
                  </button>
                </div>

                <button
                  onClick={handleNextFlashcard}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Próximo <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* RENDER QUESTIONS MODAL */}
          {type === "questions" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Questão {currentQuestionIndex + 1} de {sampleQuestions.length}</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Award className="w-4 h-4" /> Acertos: {score}
                </span>
              </div>

              {/* Statement */}
              <div className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {sampleQuestions[currentQuestionIndex].statement}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {sampleQuestions[currentQuestionIndex].options.map((option, idx) => {
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
                  {sampleQuestions[currentQuestionIndex].explanation}
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
          )}

          {/* RENDER INFOGRAFICO MODAL */}
          {type === "infografico" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Esquema Visual {currentInfographicIndex + 1} de {sampleInfographics.length}</span>
                <span className="px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase font-bold text-[10px]">
                  {sampleInfographics[currentInfographicIndex].type.replace("_", " ")}
                </span>
              </div>

              {/* Infographic Main Container */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#0F172A] text-white border border-slate-800 space-y-5 shadow-xl">
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mapa Mental / Resumo Visual
                  </span>
                  <h3 className="text-xl font-bold font-outfit text-white">
                    {sampleInfographics[currentInfographicIndex].title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {sampleInfographics[currentInfographicIndex].subtitle}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 leading-relaxed italic">
                  "{sampleInfographics[currentInfographicIndex].summary}"
                </div>

                {/* Key Points Flow */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    Pontos Chaves de Prova:
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    {sampleInfographics[currentInfographicIndex].points.map((pt, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3 text-xs text-slate-100">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <span className="flex-1 leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

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
          )}

        </div>
      </div>
    </div>
  );
}
