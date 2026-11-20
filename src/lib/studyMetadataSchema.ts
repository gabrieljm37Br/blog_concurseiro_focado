import type { InfographicHotspot, InfographicItem, InfographicSplitSlider } from "@/data/mockPosts";

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
  type?: string;
  banca?: string;
  ano?: string | number;
  year?: string | number;
  orgao?: string;
  cargo?: string;
  isSimuladoInedita?: boolean;
}

export type InfographicData = InfographicItem;

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

const VALID_INFOGRAPHIC_TYPES: ReadonlySet<InfographicItem["type"]> = new Set([
  "mapa_mental",
  "resumo_visual",
  "tabela_comparativa",
  "codigo_html",
  "hotspots_interativos",
  "comparativo_antes_depois",
]);

function normalizeInfographicHotspots(rawHotspots: unknown): InfographicHotspot[] | undefined {
  if (!Array.isArray(rawHotspots)) return undefined;
  const cleaned: InfographicHotspot[] = [];
  rawHotspots.forEach((h, idx) => {
    if (!h || typeof h !== "object") return;
    const item = h as Record<string, unknown>;
    const x = Number(item.x);
    const y = Number(item.y);
    cleaned.push({
      id: (typeof item.id === "string" || typeof item.id === "number") ? item.id : `hs-${idx + 1}`,
      x: Number.isFinite(x) ? Math.min(100, Math.max(0, x)) : 50,
      y: Number.isFinite(y) ? Math.min(100, Math.max(0, y)) : 50,
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
      bancaTip: typeof item.bancaTip === "string" ? item.bancaTip.trim() : undefined,
      badge: typeof item.badge === "string" ? item.badge.trim() : undefined,
    });
  });
  return cleaned.length > 0 ? cleaned : undefined;
}

function normalizeSplitSlider(rawSlider: unknown): InfographicSplitSlider | undefined {
  if (!rawSlider || typeof rawSlider !== "object") return undefined;
  const s = rawSlider as Record<string, unknown>;
  if (typeof s.beforeTitle !== "string" && typeof s.afterTitle !== "string") return undefined;
  return {
    beforeTitle: String(s.beforeTitle || "Antes").trim(),
    beforeSubtitle: typeof s.beforeSubtitle === "string" ? s.beforeSubtitle.trim() : undefined,
    beforeContent: String(s.beforeContent || "").trim(),
    afterTitle: String(s.afterTitle || "Depois").trim(),
    afterSubtitle: typeof s.afterSubtitle === "string" ? s.afterSubtitle.trim() : undefined,
    afterContent: String(s.afterContent || "").trim(),
    bancaHighlight: typeof s.bancaHighlight === "string" ? s.bancaHighlight.trim() : undefined,
  };
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
          type: typeof item.type === "string" ? item.type.trim() : undefined,
          banca: typeof item.banca === "string" ? item.banca.trim() : undefined,
          ano: typeof item.ano === "string" || typeof item.ano === "number" ? item.ano : undefined,
          year: typeof item.year === "string" || typeof item.year === "number" ? item.year : undefined,
          orgao: typeof item.orgao === "string" ? item.orgao.trim() : undefined,
          cargo: typeof item.cargo === "string" ? item.cargo.trim() : undefined,
          isSimuladoInedita: Boolean(item.isSimuladoInedita),
        });
      });
      cleanResult.questions = validQuestions;
    }
  }

  // Validação de Simulados
  if ("simulados" in raw) {
    if (!Array.isArray(raw.simulados)) {
      errors.push("O campo 'simulados' deve ser uma lista (array).");
    } else {
      cleanResult.simulados = raw.simulados
        .filter((s): s is Record<string, unknown> => Boolean(s && typeof s === "object"))
        .map((item, idx) => ({
          id: (item.id as string | number) || `sim-${idx + 1}`,
          statement: String(item.statement || "").trim(),
          options: Array.isArray(item.options) ? item.options.map(String) : [],
          correctAnswer: typeof item.correctAnswer === "string" ? item.correctAnswer.trim() : undefined,
          correctIndex: typeof item.correctIndex === "number" ? item.correctIndex : undefined,
          explanation: typeof item.explanation === "string" ? item.explanation.trim() : "",
          type: typeof item.type === "string" ? item.type.trim() : undefined,
          banca: typeof item.banca === "string" ? item.banca.trim() : undefined,
          ano: typeof item.ano === "string" || typeof item.ano === "number" ? item.ano : undefined,
          orgao: typeof item.orgao === "string" ? item.orgao.trim() : undefined,
          isSimuladoInedita: true,
        }));
    }
  }

  // Validação e preservação completa de Infográficos
  if ("infographics" in raw) {
    if (!Array.isArray(raw.infographics)) {
      errors.push("O campo 'infographics' deve ser uma lista (array).");
    } else {
      const validInfographics: InfographicData[] = [];
      raw.infographics.forEach((info, idx) => {
        if (!info || typeof info !== "object") {
          errors.push(`Infográfico no índice ${idx} é inválido.`);
          return;
        }
        const item = info as Record<string, unknown>;
        const rawType = typeof item.type === "string" ? item.type.trim() : "resumo_visual";
        const normalizedType: InfographicItem["type"] = VALID_INFOGRAPHIC_TYPES.has(
          rawType as InfographicItem["type"]
        )
          ? (rawType as InfographicItem["type"])
          : "resumo_visual";

        const rawId = item.id;
        const normalizedId =
          typeof rawId === "number" && Number.isFinite(rawId)
            ? rawId
            : typeof rawId === "string" && /^\d+$/.test(rawId)
            ? Number(rawId)
            : idx + 1;

        validInfographics.push({
          id: normalizedId,
          title: String(item.title || `Infográfico ${idx + 1}`).trim(),
          subtitle: String(item.subtitle || "").trim(),
          summary: String(item.summary || item.description || "").trim(),
          points: Array.isArray(item.points)
            ? item.points.map((p) => String(p).trim()).filter(Boolean)
            : [],
          type: normalizedType,
          url:
            typeof item.url === "string" && item.url.trim()
              ? item.url.trim()
              : typeof item.htmlPath === "string" && item.htmlPath.trim()
              ? item.htmlPath.trim()
              : undefined,
          codeContent: typeof item.codeContent === "string" ? item.codeContent : undefined,
          imageUrl: typeof item.imageUrl === "string" ? item.imageUrl.trim() : undefined,
          hotspots: normalizeInfographicHotspots(item.hotspots),
          splitSlider: normalizeSplitSlider(item.splitSlider),
        });
      });
      cleanResult.infographics = validInfographics;
    }
  }

  return {
    success: errors.length === 0,
    data: cleanResult,
    errors: errors.length > 0 ? errors : undefined,
  };
}
