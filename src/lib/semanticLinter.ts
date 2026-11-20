import { validateStudyMetadata } from "@/lib/studyMetadataSchema";

export type LintSeverity = "error" | "warning";

export interface SemanticLintIssue {
  code: string;
  severity: LintSeverity;
  message: string;
}

export interface SemanticLintInput {
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  featured_image?: string;
  tags?: string[] | string;
  study_data?: unknown;
}

export interface SemanticLintReport {
  isValid: boolean;
  errors: SemanticLintIssue[];
  warnings: SemanticLintIssue[];
  score: number; // 0 a 100
}

const SAFE_CHART_WIDTH_CLASSES = new Set([
  "chart-pct-5",
  "chart-pct-10",
  "chart-pct-15",
  "chart-pct-20",
  "chart-pct-25",
  "chart-pct-30",
  "chart-pct-33",
  "chart-pct-35",
  "chart-pct-40",
  "chart-pct-45",
  "chart-pct-50",
  "chart-pct-55",
  "chart-pct-60",
  "chart-pct-65",
  "chart-pct-67",
  "chart-pct-70",
  "chart-pct-75",
  "chart-pct-80",
  "chart-pct-85",
  "chart-pct-90",
  "chart-pct-92",
  "chart-pct-95",
  "chart-pct-100",
  "w-1/5",
  "w-1/4",
  "w-1/3",
  "w-2/5",
  "w-1/2",
  "w-3/5",
  "w-2/3",
  "w-3/4",
  "w-4/5",
  "w-5/6",
  "w-9/12",
  "w-10/12",
  "w-11/12",
  "w-full",
]);

/**
 * Validador Semântico Pré-Publicação (Design System + Segurança HTML + SEO + Study Data).
 * Pode ser executado em tempo real no Editor Admin e como gate na API `/api/admin/publish`.
 */
export function runSemanticLinter(input: SemanticLintInput): SemanticLintReport {
  const errors: SemanticLintIssue[] = [];
  const warnings: SemanticLintIssue[] = [];

  const title = (input.title || "").trim();
  const slug = (input.slug || "").trim();
  const summary = (input.summary || "").trim();
  const html = input.content_html || "";
  const featuredImage = (input.featured_image || "").trim();

  // 1. Metadados obrigatórios e SEO
  if (!title) {
    errors.push({ code: "MISSING_TITLE", severity: "error", message: "O título do artigo é obrigatório." });
  } else if (title.length < 20 || title.length > 90) {
    warnings.push({
      code: "TITLE_LENGTH",
      severity: "warning",
      message: `Título com ${title.length} caracteres (ideal para SEO: 40 a 68 caracteres).`,
    });
  }

  if (!slug) {
    errors.push({ code: "MISSING_SLUG", severity: "error", message: "O slug (URL amigável) é obrigatório." });
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push({
      code: "INVALID_SLUG",
      severity: "error",
      message: "Slug inválido: use apenas letras minúsculas, números e hífens (kebab-case sem acentos).",
    });
  }

  if (!summary) {
    errors.push({ code: "MISSING_SUMMARY", severity: "error", message: "O resumo (summary) é obrigatório para SEO." });
  } else if (summary.length < 100 || summary.length > 280) {
    warnings.push({
      code: "SUMMARY_LENGTH",
      severity: "warning",
      message: `Resumo com ${summary.length} caracteres (ideal para Google/OpenGraph: 140 a 240 caracteres).`,
    });
  }

  if (!html.trim()) {
    errors.push({ code: "MISSING_CONTENT", severity: "error", message: "O conteúdo HTML do artigo está vazio." });
  }

  // 2. Regras críticas do Design System Semântico & Segurança HTML
  if (/<script\b/i.test(html)) {
    errors.push({
      code: "FORBIDDEN_SCRIPT_TAG",
      severity: "error",
      message: "Tag <script> detectada no HTML do artigo (proibida por segurança XSS).",
    });
  }

  if (/<(?:html|head|body|style)\b|<!DOCTYPE/i.test(html)) {
    warnings.push({
      code: "DOCUMENT_WRAPPER_TAGS",
      severity: "warning",
      message: "Foram detectadas tags estruturais (<style>, <html>, <head>, <body>) que serão removidas ao salvar.",
    });
  }

  if (/<h1\b/i.test(html)) {
    warnings.push({
      code: "H1_IN_BODY",
      severity: "warning",
      message: "Tag <h1> detectada no corpo do artigo (use <h2> a <h4>; o <h1> pertence ao cabeçalho da página).",
    });
  }

  if (/\s+style\s*=\s*["']/i.test(html)) {
    warnings.push({
      code: "INLINE_STYLE_ATTR",
      severity: "warning",
      message: "Atributo style=\"...\" detectado no HTML. Prefira classes semânticas do Design System.",
    });
  }

  if (/<[a-z][^>]*\s+on[a-z]+\s*=/i.test(html)) {
    warnings.push({
      code: "INLINE_EVENT_HANDLER",
      severity: "warning",
      message: "Handler inline (ex: onclick=...) detectado; ele é removido na sanitização (botões .btn-copiar-lei e .btn-copy-math já funcionam via event delegation).",
    });
  }

  // Verifica entidades HTML codificadas fora de blocos <code>/<pre>
  const htmlWithoutCode = html.replace(/<(?:code|pre)\b[^>]*>[\s\S]*?<\/(?:code|pre)>/gi, "");
  if (/&(?:gt|lt);/i.test(htmlWithoutCode)) {
    warnings.push({
      code: "ENCODED_HTML_ENTITIES",
      severity: "warning",
      message: "Entidades &gt; ou &lt; detectadas fora de blocos de código; prefira UTF-8 puro.",
    });
  }

  // Verifica classes de largura em .chart-bar-fill (proteção contra purge Tailwind v4)
  const chartBarMatches = html.matchAll(/class=["']([^"']*chart-bar-fill[^"']*)["']/gi);
  for (const match of chartBarMatches) {
    const classList = match[1].split(/\s+/).filter(Boolean);
    const hasSafeWidth = classList.some((cls) => SAFE_CHART_WIDTH_CLASSES.has(cls));
    if (!hasSafeWidth) {
      warnings.push({
        code: "UNSAFE_CHART_WIDTH",
        severity: "warning",
        message: `Barra de gráfico sem largura semântica segura ("${match[1]}"). Use classes chart-pct-5 até chart-pct-100.`,
      });
    }
  }

  // 3. Mídia & OpenGraph
  if (!featuredImage) {
    warnings.push({
      code: "MISSING_COVER",
      severity: "warning",
      message: "Nenhuma imagem de capa definida (será usada a capa padrão do portal).",
    });
  } else if (featuredImage.startsWith("data:image/")) {
    warnings.push({
      code: "BASE64_COVER_IMAGE",
      severity: "warning",
      message: "Capa em Base64 (Data URI): redes sociais (WhatsApp/X/LinkedIn) não exibem Data URIs em og:image. Prefira URL HTTPS via Supabase Storage.",
    });
  }

  // 4. Validação das Ferramentas de Estudo
  if (input.study_data) {
    const validation = validateStudyMetadata(input.study_data);
    if (!validation.success && validation.errors) {
      validation.errors.forEach((msg, i) => {
        errors.push({ code: `STUDY_SCHEMA_${i + 1}`, severity: "error", message: msg });
      });
    }

    const checkQuestionBounds = (list: any[] | undefined, label: string) => {
      if (!Array.isArray(list)) return;
      list.forEach((q, idx) => {
        const optsLen = Array.isArray(q?.options) ? q.options.length : 0;
        const cIdx = typeof q?.correctIndex === "number" ? q.correctIndex : -1;
        if (optsLen >= 2 && (cIdx < 0 || cIdx >= optsLen)) {
          errors.push({
            code: "INVALID_CORRECT_INDEX",
            severity: "error",
            message: `${label} #${idx + 1}: correctIndex (${cIdx}) fora do intervalo das ${optsLen} alternativas.`,
          });
        }
      });
    };

    const sd = (validation.data || input.study_data) as Record<string, any>;
    checkQuestionBounds(sd.questions, "Questão");
    checkQuestionBounds(sd.simulados, "Simulado");
  }

  // Pontuação de qualidade editorial (0-100)
  const penalty = errors.length * 25 + warnings.length * 6;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}
