import katex from "katex";

/**
 * Regex para capturar expressões matemáticas LaTeX:
 * - Blocos: $$...$$ ou \[...\]
 * - Inline: $...$ (permitindo \$ escapado internamente, como \text{R\$ }) ou \(...\)
 * - Ignora cifrões precedidos por barra invertida (\$) ou letras de moeda (R$, US$, etc.)
 */
export const MATH_DELIMITER_REGEX =
  /(?<![\\A-Za-z])(\$\$(?:\\.|[^\$\\])+?\$\$|\\\[[\s\S]+?\\\]|\$(?:\\.|[^\$\\\n])+?(?<!\\)\$|\\\([\s\S]+?\\\))/g;

/**
 * Decodifica entidades HTML comuns que podem aparecer dentro de fórmulas LaTeX
 */
export function decodeMathEntities(code: string): string {
  return code
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

/**
 * Remove a barra invertida de cifrões escapados (ex: R\$ 20.000,00 -> R$ 20.000,00)
 * em trechos de texto comum fora de fórmulas matemáticas.
 */
export function unescapeCurrencyDollars(text: string): string {
  return text.replace(/\\+\$/g, "$");
}

/**
 * Extrai de forma segura o código LaTeX original de um elemento .math-card-body,
 * mesmo que ele já tenha sido renderizado pelo KaTeX anteriormente.
 */
export function extractMathCardLatex(el: Element): string {
  // 1. Prioriza atributo data-latex no próprio elemento ou no bloco pai .math-card-block
  const directAttr = el.getAttribute("data-latex");
  if (directAttr && directAttr.trim()) {
    return decodeMathEntities(directAttr);
  }

  const blockParent = el.closest(".math-card-block");
  const parentAttr = blockParent?.getAttribute("data-latex");
  if (parentAttr && parentAttr.trim()) {
    return decodeMathEntities(parentAttr);
  }

  // 2. Se já houver renderização KaTeX interna, extrai da tag <annotation encoding="application/x-tex">
  const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
  if (annotation && annotation.textContent && annotation.textContent.trim()) {
    return decodeMathEntities(annotation.textContent);
  }

  // 3. Caso contrário, lê do textContent bruto (apenas se não houver .katex já renderizado)
  if (el.querySelector(".katex")) {
    return "";
  }

  const text = el.textContent || "";
  if (text.includes("$$")) {
    const match = text.match(/\$\$([\s\S]+?)\$\$/);
    if (match && match[1]) {
      return decodeMathEntities(match[1]);
    }
  } else if (text.trim().startsWith("\\[") && text.trim().endsWith("\\]")) {
    return decodeMathEntities(text.trim().slice(2, -2));
  } else if (text.includes("\\")) {
    return decodeMathEntities(text);
  }

  return "";
}

/**
 * Analisa um fragmento capturado pela MATH_DELIMITER_REGEX e retorna se é matemática,
 * se é displayMode e o código LaTeX limpo.
 */
export function parseMathPart(part: string): {
  isMath: boolean;
  isDisplay: boolean;
  mathCode: string;
} {
  if (!part) return { isMath: false, isDisplay: false, mathCode: "" };

  if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
    return {
      isMath: true,
      isDisplay: true,
      mathCode: decodeMathEntities(part.slice(2, -2)),
    };
  }
  if (part.startsWith("\\[") && part.endsWith("\\]") && part.length > 4) {
    return {
      isMath: true,
      isDisplay: true,
      mathCode: decodeMathEntities(part.slice(2, -2)),
    };
  }
  if (
    part.startsWith("$") &&
    !part.startsWith("\\$") &&
    part.endsWith("$") &&
    !part.endsWith("\\$") &&
    part.length > 2
  ) {
    return {
      isMath: true,
      isDisplay: false,
      mathCode: decodeMathEntities(part.slice(1, -1)),
    };
  }
  if (part.startsWith("\\(") && part.endsWith("\\)") && part.length > 4) {
    return {
      isMath: true,
      isDisplay: false,
      mathCode: decodeMathEntities(part.slice(2, -2)),
    };
  }

  return { isMath: false, isDisplay: false, mathCode: "" };
}

/**
 * Hidrata todos os cards .math-card-body e fórmulas inline/bloco ($...$, $$...$$, \(...\), \[...\])
 * dentro de um container DOM, além de limpar R\$ escapados no texto comum.
 */
export function hydrateMathInContainer(container: HTMLElement): void {
  if (!container || typeof document === "undefined") return;

  // 1. Hidrata blocos .math-card-body
  const mathCardBodies = container.querySelectorAll(".math-card-body");
  mathCardBodies.forEach((el) => {
    const mathCode = extractMathCardLatex(el);
    if (mathCode) {
      el.setAttribute("data-latex", mathCode);
      const blockParent = el.closest(".math-card-block");
      if (blockParent && !blockParent.getAttribute("data-latex")) {
        blockParent.setAttribute("data-latex", mathCode);
      }
      try {
        el.innerHTML = katex.renderToString(mathCode, {
          displayMode: true,
          throwOnError: false,
          strict: "ignore",
        });
      } catch (e) {}
    }
  });

  // 2. Hidrata fórmulas inline ($...$, \(...\)) e blocos ($$...$$, \[...\]) nos nós de texto
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodesToProcess: { node: Text; parent: HTMLElement; text: string }[] = [];

  let currentNode = walker.nextNode();
  while (currentNode) {
    const text = currentNode.nodeValue || "";
    const parent = currentNode.parentElement;

    if (
      text &&
      parent &&
      !parent.closest(".katex") &&
      !parent.closest(".katex-inline-node") &&
      !parent.closest(".math-card-body") &&
      !parent.closest("script") &&
      !parent.closest("style") &&
      !parent.closest("code") &&
      !parent.closest("pre") &&
      !parent.closest("textarea") &&
      !parent.closest("svg") &&
      !parent.closest("button")
    ) {
      MATH_DELIMITER_REGEX.lastIndex = 0;
      if (MATH_DELIMITER_REGEX.test(text) || text.includes("\\$")) {
        nodesToProcess.push({
          node: currentNode as Text,
          parent,
          text,
        });
      }
    }
    currentNode = walker.nextNode();
  }

  nodesToProcess.forEach(({ node, parent, text }) => {
    MATH_DELIMITER_REGEX.lastIndex = 0;
    if (!MATH_DELIMITER_REGEX.test(text)) {
      // Apenas texto comum com cifrão escapado (ex: R\$ 20.000,00)
      node.nodeValue = unescapeCurrencyDollars(text);
      return;
    }

    MATH_DELIMITER_REGEX.lastIndex = 0;
    const parts = text.split(MATH_DELIMITER_REGEX);
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (!part) return;
      const { isMath, isDisplay, mathCode } = parseMathPart(part);

      if (isMath && mathCode) {
        try {
          const mathSpan = document.createElement("span");
          mathSpan.className = isDisplay
            ? "katex-inline-node block my-2 text-center overflow-x-auto"
            : "katex-inline-node";
          mathSpan.setAttribute("data-latex", mathCode);
          mathSpan.setAttribute("data-display", isDisplay ? "true" : "false");
          mathSpan.innerHTML = katex.renderToString(mathCode, {
            displayMode: isDisplay,
            throwOnError: false,
            strict: "ignore",
          });
          fragment.appendChild(mathSpan);
        } catch (e) {
          fragment.appendChild(document.createTextNode(unescapeCurrencyDollars(part)));
        }
      } else {
        fragment.appendChild(document.createTextNode(unescapeCurrencyDollars(part)));
      }
    });

    if (parent.contains(node)) {
      parent.replaceChild(fragment, node);
    }
  });
}

/**
 * Restaura elementos KaTeX renderizados no DOM de volta para delimitadores LaTeX puros
 * ($$ ... $$ ou $ ... $), evitando que o HTML interno do KaTeX seja salvo no banco de dados.
 */
export function restoreLatexFromRenderedHtml(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html;
  }

  if (
    !html.includes("katex") &&
    !html.includes("math-card-body")
  ) {
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 1. Restaura .math-card-body
    doc.querySelectorAll(".math-card-body").forEach((el) => {
      const mathCode = extractMathCardLatex(el);
      if (mathCode) {
        el.innerHTML = `\n    $$ ${mathCode} $$\n  `;
      }
    });

    // 2. Restaura spans .katex-inline-node criados na hidratação
    doc.querySelectorAll(".katex-inline-node").forEach((el) => {
      const latex =
        el.getAttribute("data-latex") ||
        el.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim() ||
        "";
      const isDisplay =
        el.getAttribute("data-display") === "true" ||
        !!el.querySelector(".katex-display");

      if (latex) {
        const delimiterText = isDisplay ? `$$${latex}$$` : `$${latex}$`;
        el.replaceWith(doc.createTextNode(delimiterText));
      }
    });

    // 3. Restaura eventuais .katex-display ou .katex avulsos salvos anteriormente
    doc.querySelectorAll(".katex-display").forEach((el) => {
      if (el.closest(".math-card-body")) return;
      const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
      if (annotation && annotation.textContent?.trim()) {
        el.replaceWith(doc.createTextNode(`$$ ${annotation.textContent.trim()} $$`));
      }
    });

    doc.querySelectorAll(".katex").forEach((el) => {
      if (el.closest(".math-card-body")) return;
      const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
      if (annotation && annotation.textContent?.trim()) {
        el.replaceWith(doc.createTextNode(`$${annotation.textContent.trim()}$`));
      }
    });

    return doc.body.innerHTML;
  } catch (e) {
    return html;
  }
}
