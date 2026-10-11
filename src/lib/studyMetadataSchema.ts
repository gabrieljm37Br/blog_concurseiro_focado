export interface FlashcardData {
  id: string | number;
  question: string;
  answer: string;
  bancaTip?: string;
  category?: string;
}

export interface QuestionData {
  id: string | number;
  statement: string;
  options: string[];
  correctAnswer?: string;
  correctIndex?: number;
  explanation: string;
  banca?: string;
  ano?: string | number;
  orgao?: string;
  cargo?: string;
  isSimuladoInedita?: boolean;
}

export interface InfographicData {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  htmlPath?: string;
}

export interface StudyMetadata {
  flashcards?: FlashcardData[];
  questions?: QuestionData[];
  simulados?: QuestionData[];
  infographics?: InfographicData[];
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validador semântico leve e sem dependências externas para garantir
 * que o payload STUDY_DATA_JSON siga o contrato visual e funcional do blog.
 */
export function validateStudyMetadata(data: unknown): ValidationResult<StudyMetadata> {
  if (!data || typeof data !== "object") {
    return { success: false, errors: ["O payload de dados de estudo deve ser um objeto JSON válido."] };
  }

  const errors: string[] = [];
  const raw = data as Record<string, unknown>;
  const cleanResult: StudyMetadata = {};

  // Validação de Flashcards
  if ("flashcards" in raw) {
    if (!Array.isArray(raw.flashcards)) {
      errors.push("O campo 'flashcards' deve ser uma lista (array).");
    } else {
      const validFlashcards: FlashcardData[] = [];
      raw.flashcards.forEach((fc, idx) => {
        if (!fc || typeof fc !== "object") {
          errors.push(`Flashcard no índice ${idx} é inválido.`);
          return;
        }
        const item = fc as Record<string, unknown>;
        if (typeof item.question !== "string" || !item.question.trim()) {
          errors.push(`Flashcard #${idx + 1}: pergunta ('question') obrigatória ausente.`);
        }
        if (typeof item.answer !== "string" || !item.answer.trim()) {
          errors.push(`Flashcard #${idx + 1}: resposta ('answer') obrigatória ausente.`);
        }

        validFlashcards.push({
          id: (item.id as string | number) || `fc-${idx + 1}`,
          question: String(item.question || "").trim(),
          answer: String(item.answer || "").trim(),
          bancaTip: typeof item.bancaTip === "string" ? item.bancaTip.trim() : undefined,
          category: typeof item.category === "string" ? item.category.trim() : undefined,
        });
      });
      cleanResult.flashcards = validFlashcards;
    }
  }

  // Validação de Questões
  if ("questions" in raw) {
    if (!Array.isArray(raw.questions)) {
      errors.push("O campo 'questions' deve ser uma lista (array).");
    } else {
      const validQuestions: QuestionData[] = [];
      raw.questions.forEach((q, idx) => {
        if (!q || typeof q !== "object") {
          errors.push(`Questão no índice ${idx} é inválida.`);
          return;
        }
        const item = q as Record<string, unknown>;
        if (typeof item.statement !== "string" || !item.statement.trim()) {
          errors.push(`Questão #${idx + 1}: enunciado ('statement') obrigatório ausente.`);
        }
        if (!Array.isArray(item.options) || item.options.length < 2) {
          errors.push(`Questão #${idx + 1}: alternativas ('options') devem conter no mínimo 2 itens.`);
        }

        validQuestions.push({
          id: (item.id as string | number) || `q-${idx + 1}`,
          statement: String(item.statement || "").trim(),
          options: Array.isArray(item.options) ? item.options.map(String) : [],
          correctAnswer: typeof item.correctAnswer === "string" ? item.correctAnswer.trim() : undefined,
          correctIndex: typeof item.correctIndex === "number" ? item.correctIndex : undefined,
          explanation: typeof item.explanation === "string" ? item.explanation.trim() : "",
          banca: typeof item.banca === "string" ? item.banca.trim() : undefined,
          ano: typeof item.ano === "string" || typeof item.ano === "number" ? item.ano : undefined,
          orgao: typeof item.orgao === "string" ? item.orgao.trim() : undefined,
          cargo: typeof item.cargo === "string" ? item.cargo.trim() : undefined,
          isSimuladoInedita: Boolean(item.isSimuladoInedita),
        });
      });
      cleanResult.questions = validQuestions;
    }
  }

  // Validação de Simulados
  if ("simulados" in raw && Array.isArray(raw.simulados)) {
    cleanResult.simulados = raw.simulados.map((s, idx) => {
      const item = s as Record<string, unknown>;
      return {
        id: (item.id as string | number) || `sim-${idx + 1}`,
        statement: String(item.statement || "").trim(),
        options: Array.isArray(item.options) ? item.options.map(String) : [],
        correctAnswer: typeof item.correctAnswer === "string" ? item.correctAnswer.trim() : undefined,
        correctIndex: typeof item.correctIndex === "number" ? item.correctIndex : undefined,
        explanation: typeof item.explanation === "string" ? item.explanation.trim() : "",
        banca: typeof item.banca === "string" ? item.banca.trim() : undefined,
        ano: typeof item.ano === "string" || typeof item.ano === "number" ? item.ano : undefined,
        isSimuladoInedita: true,
      };
    });
  }

  return {
    success: errors.length === 0,
    data: cleanResult,
    errors: errors.length > 0 ? errors : undefined,
  };
}
