"use client";

import React, { useMemo } from "react";
import katex from "katex";
import {
  MATH_DELIMITER_REGEX,
  parseMathPart,
  decodeMathEntities,
  unescapeCurrencyDollars,
} from "@/lib/katexHelper";

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Componente MathRenderer para renderizar fórmulas matemáticas em LaTeX
 * Suporta:
 * - Equações em bloco: $$...$$ ou \[...\]
 * - Equações inline: $...$ ou \(...\)
 * - Auto-detecção de comandos LaTeX comuns (\frac, \sqrt, \sum, \int, \lim, \matrix, etc.)
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = "",
  inline = false,
}) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Expressão regular para encontrar delimitadores $$...$$, \[...\], $...$, \(...\)
    MATH_DELIMITER_REGEX.lastIndex = 0;
    const parts = content.split(MATH_DELIMITER_REGEX);

    return parts.map((part, index) => {
      if (!part) return null;

      const parsed = parseMathPart(part);
      let isDisplay = parsed.isDisplay;
      let mathCode = parsed.mathCode;
      let isMath = parsed.isMath;

      if (
        !isMath &&
        /\\(frac|sqrt|sum|int|lim|matrix|vec|alpha|beta|theta|pi|sigma|infty|cdot|times|div|pm|approx|le|ge|ne|rightarrow|left|right)/.test(
          part
        ) &&
        !part.includes("<") &&
        !part.includes(">")
      ) {
        // Detecção automática de comandos LaTeX avulsos sem delimitadores $
        isMath = true;
        isDisplay = !inline && (part.includes("\\begin") || part.includes("\\frac"));
        mathCode = decodeMathEntities(part);
      }

      if (isMath && mathCode) {
        try {
          const html = katex.renderToString(mathCode, {
            displayMode: isDisplay,
            throwOnError: false,
            strict: "ignore",
            output: "htmlAndMathml",
          });

          if (isDisplay) {
            return (
              <span
                key={index}
                className="block my-2 text-center overflow-x-auto py-1.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } else {
            return (
              <span
                key={index}
                className="inline-block px-0.5 align-middle"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
        } catch (err) {
          return <span key={index}>{unescapeCurrencyDollars(part)}</span>;
        }
      }

      return <span key={index}>{unescapeCurrencyDollars(part)}</span>;
    });
  }, [content, inline]);

  const Tag = inline ? "span" : "div";

  return <Tag className={`katex-wrapper ${className}`}>{renderedElements}</Tag>;
};

export default MathRenderer;
