export type EditorialStatus = "published" | "draft" | "review" | "scheduled";

export interface ArticleVisibilityInfo {
  status: EditorialStatus;
  scheduledAt: string | null;
  isPublic: boolean;
}

/**
 * Extrai status editorial e data de agendamento dos comentários estruturais
 * e da coluna `is_published`, determinando se o artigo pode ser exibido ao público.
 */
export function getArticleVisibility(
  contentHtml: string | null | undefined,
  isPublished?: boolean | null,
  now: Date = new Date(),
  columnStatus?: string | null,
  columnScheduledAt?: string | null
): ArticleVisibilityInfo {
  const html = contentHtml || "";
  let status: EditorialStatus = isPublished === false ? "draft" : "published";
  let scheduledAt: string | null = columnScheduledAt?.trim() || null;

  if (columnStatus) {
    const normalizedColStatus = columnStatus.trim().toLowerCase();
    if (
      normalizedColStatus === "published" ||
      normalizedColStatus === "draft" ||
      normalizedColStatus === "review" ||
      normalizedColStatus === "scheduled"
    ) {
      status = normalizedColStatus;
    }
  } else {
    const statusMatch = html.match(/<!--\s*STATUS:\s*([\s\S]*?)\s*-->/i);
    if (statusMatch && statusMatch[1]) {
      const rawStatus = statusMatch[1].trim().toLowerCase();
      if (
        rawStatus === "published" ||
        rawStatus === "draft" ||
        rawStatus === "review" ||
        rawStatus === "scheduled"
      ) {
        status = rawStatus;
      }
    }
  }

  if (!scheduledAt) {
    const schedMatch = html.match(/<!--\s*SCHEDULED_AT:\s*([\s\S]*?)\s*-->/i);
    if (schedMatch && schedMatch[1]) {
      scheduledAt = schedMatch[1].trim();
    }
  }

  if (status === "draft" || status === "review") {
    return { status, scheduledAt, isPublic: false };
  }

  if (status === "scheduled") {
    if (!scheduledAt) {
      return { status, scheduledAt, isPublic: false };
    }
    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate > now) {
      return { status, scheduledAt, isPublic: false };
    }
    return { status, scheduledAt, isPublic: true };
  }

  if (isPublished === false) {
    return { status: "draft", scheduledAt, isPublic: false };
  }

  return { status, scheduledAt, isPublic: true };
}

/**
 * Extrai com resiliência o payload JSON das ferramentas de estudo embutido no `content_html`.
 * Suporta:
 * 1. `STUDY_DATA_JSON_B64` codificado via `encodeURIComponent` (padrão do portal)
 * 2. `STUDY_DATA_JSON_B64` codificado em Base64 real (fallback defensivo para saídas de IA)
 * 3. `STUDY_DATA_JSON` em JSON puro
 * 4. Recuperação relaxada para comentários truncados ou malformados
 */
export function extractStudyDataFromContentHtml(contentHtml: string | null | undefined): unknown {
  if (!contentHtml) return null;

  // 1. Check STUDY_DATA_JSON_B64
  const b64Match = contentHtml.match(/<!--\s*STUDY_DATA_JSON_B64:\s*([\s\S]*?)\s*-->/i);
  if (b64Match && b64Match[1]) {
    const payload = b64Match[1].trim();
    try {
      return JSON.parse(decodeURIComponent(payload));
    } catch {
      // Fallback defensivo caso uma IA tenha aplicado Base64 real
      try {
        const decoded =
          typeof Buffer !== "undefined"
            ? Buffer.from(payload, "base64").toString("utf-8")
            : decodeURIComponent(escape(atob(payload)));
        return JSON.parse(decoded);
      } catch {
        // Segue para próximos fallbacks
      }
    }
  }

  // 2. Check legacy STUDY_DATA_JSON
  const legacyMatch = contentHtml.match(/<!--\s*STUDY_DATA_JSON:\s*([\s\S]*?)\s*-->/i);
  if (legacyMatch && legacyMatch[1]) {
    try {
      return JSON.parse(legacyMatch[1].trim());
    } catch {
      // Segue para recuperação relaxada
    }
  }

  // 3. Relaxed recovery
  const startIdx = contentHtml.indexOf("<!-- STUDY_DATA_JSON:");
  if (startIdx !== -1) {
    let sub = contentHtml.substring(startIdx + "<!-- STUDY_DATA_JSON:".length);
    const lastEnd = sub.lastIndexOf("-->");
    if (lastEnd !== -1) sub = sub.substring(0, lastEnd);
    sub = sub.trim();
    try {
      return JSON.parse(sub);
    } catch {
      // Segue para recuperação final
    }
  }

  // 4. Ultimate recovery
  const jsonMatch =
    contentHtml.match(/\{"flashcards":[\s\S]*?\}(?=\s*(?:-->|$))/i) ||
    contentHtml.match(/\{"flashcards":[\s\S]*/i);
  if (jsonMatch) {
    let str = jsonMatch[0].trim().replace(/-->\s*$/g, "").trim();
    if (!str.endsWith("}")) {
      const lastCurly = str.lastIndexOf("}");
      if (lastCurly !== -1) str = str.substring(0, lastCurly + 1);
    }
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Remove blocos estruturais de metadados e sanitiza o HTML do artigo contra XSS
 * antes da renderização, preservando integralmente as classes do Design System Semântico,
 * SVGs de diagramas, KaTeX, tabelas, figuras e spoilers.
 */
export function cleanAndSanitizeArticleHtml(rawHtml: string | null | undefined): string {
  if (!rawHtml) return "";

  let html = rawHtml
    // Remove comentários de metadados
    .replace(/<!--\s*STUDY_DATA_JSON_B64:[\s\S]*?-->/gi, "")
    .replace(/<!--\s*STUDY_DATA_JSON:[\s\S]*?-->/gi, "")
    .replace(/<!--\s*TAGS:[\s\S]*?-->/gi, "")
    .replace(/<!--\s*STATUS:[\s\S]*?-->/gi, "")
    .replace(/<!--\s*SCHEDULED_AT:[\s\S]*?-->/gi, "")
    .replace(/,"points":\["Revisão rápida de pontos de alta incidência"\]\]\}?\s*-->/gi, "")
    // Normalizações editoriais existentes
    .replace(/^\s*(?:<!--[\s\S]*?-->\s*)?<div[^>]*border-b[^>]*>\s*<h1[^>]*>[\s\S]*?<\/h1>\s*<\/div>/gi, "")
    .replace(/^\s*(?:<!--[\s\S]*?-->\s*)?<h1[^>]*>[\s\S]*?<\/h1>/gi, "")
    .replace(
      /<h1([^>]*)>([\s\S]*?)<\/h1>/gi,
      '<h2 class="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2"$1>$2</h2>'
    )
    .replace(
      /<h2[^>]*>\s*<img[^>]*src="data:image[^"]*"[^>]*\/?>\s*/gi,
      '<h2 class="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white mt-8 mb-4">'
    )
    .replace(/style="[^"]*max-width:[^"]*"/gi, "");

  // Remove tags perigosas com conteúdo interno
  const dangerousBlockTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "applet",
    "foreignobject",
    "form",
    "noscript",
  ];
  for (const tag of dangerousBlockTags) {
    html = html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi"), "");
    html = html.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi"), "");
  }

  // Remove tags void perigosas
  html = html.replace(/<\/?(?:meta|link|base|input|textarea|select)\b[^>]*>/gi, "");

  // Sanitiza atributos apenas dentro de tags HTML válidas (sem afetar texto comum ou LaTeX)
  html = html.replace(/<([a-zA-Z][a-zA-Z0-9:-]*)(\s[^>]*)?>/g, (fullMatch, tagName: string, rawAttrs?: string) => {
    if (!rawAttrs) return fullMatch;

    const isSelfClosing = /\/\s*$/.test(rawAttrs);
    let attrs = isSelfClosing ? rawAttrs.replace(/\/\s*$/, "") : rawAttrs;

    // 1. Remove handlers inline (onclick, onerror, onload, etc.) — substituídos por event delegation
    attrs = attrs.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

    // 2. Remove srcdoc
    attrs = attrs.replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

    // 3. Sanitiza URLs em href, src, xlink:href, action, formaction
    attrs = attrs.replace(
      /\s+(href|src|xlink:href|action|formaction)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
      (attrMatch, attrName: string, dqVal?: string, sqVal?: string, uqVal?: string) => {
        const val = (dqVal ?? sqVal ?? uqVal ?? "").trim();
        const normalized = val.replace(/[\u0000-\u0020]+/g, "").toLowerCase();

        // Bloqueia javascript:, vbscript:, data:text/html, data:image/svg+xml
        if (
          normalized.startsWith("javascript:") ||
          normalized.startsWith("vbscript:") ||
          normalized.startsWith("data:text/html") ||
          normalized.startsWith("data:image/svg") ||
          (attrName.toLowerCase() === "href" && normalized.startsWith("data:"))
        ) {
          return "";
        }

        return attrMatch;
      }
    );

    return `<${tagName}${attrs}${isSelfClosing ? " /" : ""}>`;
  });

  return html;
}

/**
 * Gera um ID semântico determinístico a partir do texto de um cabeçalho HTML.
 */
export function slugifyHeadingText(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base ? `sec-${base}-${index}` : `sec-topico-${index}`;
}

/**
 * Injeta atributos `id` determinísticos diretamente nas tags <h2> e <h3> do HTML sanitizado.
 * Garante que o Sumário do Artigo (ToC) nunca perca referências de âncora após re-renders
 * do React ou hidratação SSR/CSR.
 */
export function injectHeadingIds(html: string): string {
  if (!html) return "";
  let headingCounter = 0;
  const usedIds = new Set<string>();

  return html.replace(
    /<(h[23])(\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (fullMatch, tag: string, rawAttrs: string, innerHtml: string) => {
      const plainText = innerHtml
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#?\w+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!plainText || plainText.length < 2) {
        return fullMatch;
      }

      headingCounter += 1;

      const existingIdMatch = rawAttrs.match(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const existingId = (existingIdMatch?.[1] || existingIdMatch?.[2] || existingIdMatch?.[3] || "").trim();

      if (existingId && !usedIds.has(existingId)) {
        usedIds.add(existingId);
        return fullMatch;
      }

      let nextId = slugifyHeadingText(plainText, headingCounter);
      while (usedIds.has(nextId)) {
        headingCounter += 1;
        nextId = slugifyHeadingText(plainText, headingCounter);
      }
      usedIds.add(nextId);

      // Remove eventual id vazio ou duplicado antes de injetar o novo id único
      const cleanedAttrs = rawAttrs.replace(/\s+\bid\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
      return `<${tag} id="${nextId}"${cleanedAttrs}>${innerHtml}</${tag}>`;
    }
  );
}
