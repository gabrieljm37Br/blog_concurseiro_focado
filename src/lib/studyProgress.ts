/**
 * Motor local de Retenção (SRS / SM-2 simplificado) e Caderno de Erros
 * Blog Concurseiro Focado — Fase 4
 */

export interface SrsFlashcardRecord {
  key: string; // `${articleSlug}::${cardId}`
  articleSlug: string;
  articleTitle: string;
  cardId: string;
  question: string;
  answer: string;
  bancaTip?: string;
  category?: string;
  repetitions: number;
  intervalDays: number;
  nextReviewAt: string; // ISO
  lastReviewedAt: string; // ISO
  lastResult: "correct" | "wrong";
  wrongCount: number;
  correctCount: number;
}

export interface QuestionAttemptRecord {
  key: string; // `${articleSlug}::${mode}::${questionId}`
  articleSlug: string;
  articleTitle: string;
  mode: "questions" | "simulado";
  questionId: string;
  statement: string;
  banca?: string;
  lastResult: "correct" | "wrong" | "blank";
  attempts: number;
  wrongCount: number;
  correctCount: number;
  lastAnsweredAt: string; // ISO
}

export interface StudyProgressStore {
  version: 1;
  flashcards: Record<string, SrsFlashcardRecord>;
  questions: Record<string, QuestionAttemptRecord>;
}

const STORAGE_KEY = "cf_study_progress_v1";
const SRS_INTERVALS_DAYS = [1, 3, 7, 15, 30, 60];

function getEmptyStore(): StudyProgressStore {
  return { version: 1, flashcards: {}, questions: {} };
}

export function loadStudyProgress(): StudyProgressStore {
  if (typeof window === "undefined") return getEmptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyStore();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return getEmptyStore();
    return {
      version: 1,
      flashcards: parsed.flashcards && typeof parsed.flashcards === "object" ? parsed.flashcards : {},
      questions: parsed.questions && typeof parsed.questions === "object" ? parsed.questions : {},
    };
  } catch {
    return getEmptyStore();
  }
}

function saveStudyProgress(store: StudyProgressStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota do navegador excedida
  }
}

/**
 * Registra revisão de Flashcard aplicando repetição espaçada (SM-2 simplificado).
 * - Errou: reinicia repetições e agenda para revisão imediata (hoje / 1 dia).
 * - Acertou: avança na curva 1d → 3d → 7d → 15d → 30d → 60d.
 */
export function recordFlashcardReview(params: {
  articleSlug: string;
  articleTitle: string;
  cardId: string | number;
  question: string;
  answer: string;
  bancaTip?: string;
  category?: string;
  result: "correct" | "wrong";
}): SrsFlashcardRecord {
  const store = loadStudyProgress();
  const safeSlug = params.articleSlug || "artigo";
  const key = `${safeSlug}::${String(params.cardId)}`;
  const prev = store.flashcards[key];
  const now = new Date();

  const nextReps = params.result === "correct" ? (prev?.repetitions || 0) + 1 : 0;
  const intervalDays =
    params.result === "correct"
      ? SRS_INTERVALS_DAYS[Math.min(nextReps - 1, SRS_INTERVALS_DAYS.length - 1)]
      : 0;

  const nextReviewDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  const record: SrsFlashcardRecord = {
    key,
    articleSlug: safeSlug,
    articleTitle: params.articleTitle,
    cardId: String(params.cardId),
    question: params.question,
    answer: params.answer,
    bancaTip: params.bancaTip,
    category: params.category,
    repetitions: nextReps,
    intervalDays,
    nextReviewAt: nextReviewDate.toISOString(),
    lastReviewedAt: now.toISOString(),
    lastResult: params.result,
    wrongCount: (prev?.wrongCount || 0) + (params.result === "wrong" ? 1 : 0),
    correctCount: (prev?.correctCount || 0) + (params.result === "correct" ? 1 : 0),
  };

  store.flashcards[key] = record;
  saveStudyProgress(store);
  return record;
}

/**
 * Registra tentativa em Questão de Prova ou Simulado no Caderno de Erros.
 */
export function recordQuestionAttempt(params: {
  articleSlug: string;
  articleTitle: string;
  mode: "questions" | "simulado";
  questionId: string | number;
  statement: string;
  banca?: string;
  result: "correct" | "wrong" | "blank";
}): QuestionAttemptRecord {
  const store = loadStudyProgress();
  const safeSlug = params.articleSlug || "artigo";
  const key = `${safeSlug}::${params.mode}::${String(params.questionId)}`;
  const prev = store.questions[key];

  const record: QuestionAttemptRecord = {
    key,
    articleSlug: safeSlug,
    articleTitle: params.articleTitle,
    mode: params.mode,
    questionId: String(params.questionId),
    statement: params.statement,
    banca: params.banca,
    lastResult: params.result,
    attempts: (prev?.attempts || 0) + 1,
    wrongCount: (prev?.wrongCount || 0) + (params.result === "wrong" ? 1 : 0),
    correctCount: (prev?.correctCount || 0) + (params.result === "correct" ? 1 : 0),
    lastAnsweredAt: new Date().toISOString(),
  };

  store.questions[key] = record;
  saveStudyProgress(store);
  return record;
}

export function clearQuestionFromErrorNotebook(key: string): void {
  const store = loadStudyProgress();
  if (store.questions[key]) {
    store.questions[key].lastResult = "correct";
    saveStudyProgress(store);
  }
}

export function getDueFlashcards(now: Date = new Date()): SrsFlashcardRecord[] {
  const store = loadStudyProgress();
  return Object.values(store.flashcards)
    .filter((card) => new Date(card.nextReviewAt) <= now || card.lastResult === "wrong")
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());
}

export function getErrorNotebookQuestions(): QuestionAttemptRecord[] {
  const store = loadStudyProgress();
  return Object.values(store.questions)
    .filter((q) => q.lastResult === "wrong")
    .sort((a, b) => new Date(b.lastAnsweredAt).getTime() - new Date(a.lastAnsweredAt).getTime());
}

export function getSavedArticleSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem("cf_saved_articles") || "[]");
    return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}
