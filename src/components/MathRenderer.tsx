"use client";

import React, { useMemo } from "react";
import katex from "katex";

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
    const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      let isDisplay = false;
      let mathCode = "";
      let isMath = false;

      if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
        isMath = true;
        isDisplay = true;
        mathCode = part.slice(2, -2).trim();
      } else if (part.startsWith("\\[") && part.endsWith("\\]") && part.length > 4) {
        isMath = true;
        isDisplay = true;
        mathCode = part.slice(2, -2).trim();
      } else if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        isMath = true;
        isDisplay = false;
        mathCode = part.slice(1, -1).trim();
      } else if (part.startsWith("\\(") && part.endsWith("\\)") && part.length > 4) {
        isMath = true;
        isDisplay = false;
        mathCode = part.slice(2, -2).trim();
      } else if (
        /\\(frac|sqrt|sum|int|lim|matrix|vec|alpha|beta|theta|pi|sigma|infty|cdot|times|div|pm|approx|le|ge|ne|rightarrow|left|right)/.test(
          part
        ) &&
        !part.includes("<") &&
        !part.includes(">")
      ) {
        // Detecção automática de comandos LaTeX avulsos sem delimitadores $
        isMath = true;
        isDisplay = !inline && (part.includes("\\begin") || part.includes("\\frac"));
        mathCode = part.trim();
      }

      if (isMath && mathCode) {
        try {
          const html = katex.renderToString(mathCode, {
            displayMode: isDisplay,
            throwOnError: false,
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
          return <span key={index}>{part}</span>;
        }
      }

      return <span key={index}>{part}</span>;
    });
  }, [content, inline]);

  const Tag = inline ? "span" : "div";

  return <Tag className={`katex-wrapper ${className}`}>{renderedElements}</Tag>;
};

export default MathRenderer;
