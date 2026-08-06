"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Superscript,
  Subscript,
  Highlighter,
  Heading1,
  Heading2, 
  Heading3, 
  Heading4,
  Type,
  List, 
  ListOrdered, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Code, 
  Eye, 
  Edit3, 
  FileCode, 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  BookOpen, 
  Sigma,
  Table as TableIcon,
  Quote,
  Undo2,
  Redo2,
  Eraser,
  Pin,
  Brain,
  BarChart2,
  GitMerge,
  HelpCircle,
  Shapes,
  RefreshCw
} from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";
import IconPickerModal from "./IconPickerModal";
import katex from "katex";
import { 
  DicaGradientIcon, 
  PegadinhaGradientIcon, 
  LeiGradientIcon, 
  BrainGradientIcon, 
  MathGradientIcon 
} from "@/components/icons/GradientIcons";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [editorMode, setEditorMode] = useState<"visual" | "markdown" | "code">("visual");
  const [showPreview, setShowPreview] = useState(false);
  const [isStickyToolbar, setIsStickyToolbar] = useState<boolean>(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [isSyncScrollActive, setIsSyncScrollActive] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef<boolean>(false);

  // Helper to determine the active scroll element on the editor side
  const getEditorScrollElement = (): HTMLElement | null => {
    if (editorMode !== "visual" && textareaRef.current) {
      return textareaRef.current;
    }
    return leftPanelRef.current || editableRef.current;
  };

  // Synchronized scroll from Editor to Preview
  const handleEditorScroll = (e: React.UIEvent<HTMLElement>) => {
    if (isSyncingScrollRef.current || !showPreview || !isSyncScrollActive) return;
    const editor = e.currentTarget;
    const preview = previewScrollRef.current;
    if (!preview) return;

    const maxEditorScroll = editor.scrollHeight - editor.clientHeight;
    if (maxEditorScroll <= 0) return;

    const scrollPercentage = editor.scrollTop / maxEditorScroll;
    const maxPreviewScroll = preview.scrollHeight - preview.clientHeight;

    isSyncingScrollRef.current = true;
    preview.scrollTop = scrollPercentage * maxPreviewScroll;

    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  // Synchronized scroll from Preview to Editor
  const handlePreviewScroll = (e: React.UIEvent<HTMLElement>) => {
    if (isSyncingScrollRef.current || !showPreview || !isSyncScrollActive) return;
    const preview = e.currentTarget;
    const editor = getEditorScrollElement();
    if (!editor) return;

    const maxPreviewScroll = preview.scrollHeight - preview.clientHeight;
    if (maxPreviewScroll <= 0) return;

    const scrollPercentage = preview.scrollTop / maxPreviewScroll;
    const maxEditorScroll = editor.scrollHeight - editor.clientHeight;

    isSyncingScrollRef.current = true;
    editor.scrollTop = scrollPercentage * maxEditorScroll;

    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  // Undo / Redo History State
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const sanitizeArticleHtml = (html: string): string => {
    if (!html) return "";
    return html
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      .replace(/<\/?(html|head|body)[^>]*>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<meta[^>]*>/gi, "")
      .replace(/<title[\s\S]*?<\/title>/gi, "")
      .trim();
  };

  // Helper to push new state to Undo history
  const pushToHistory = (newValue: string) => {
    const cleanValue = sanitizeArticleHtml(newValue);
    if (cleanValue === value) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(cleanValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onChange(cleanValue);
  };

  // Undo (CTRL + Z)
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevValue = history[prevIndex];
      if (editableRef.current && editorMode === "visual") {
        editableRef.current.innerHTML = prevValue;
      }
      onChange(prevValue);
    }
  };

  // Redo (CTRL + Y / CTRL + SHIFT + Z)
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextValue = history[nextIndex];
      if (editableRef.current && editorMode === "visual") {
        editableRef.current.innerHTML = nextValue;
      }
      onChange(nextValue);
    }
  };

  // Clear Formatting (Limpar Formatação)
  const handleClearFormatting = () => {
    if (editorMode === "visual" && editableRef.current) {
      document.execCommand("removeFormat", false);
      document.execCommand("formatBlock", false, "<p>");
      pushToHistory(editableRef.current.innerHTML);
    } else {
      const cleanText = value.replace(/<[^>]*>/g, "");
      pushToHistory(cleanText);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    }
  };

  // Smart Paste Handler (Purifica texto colado e forca dimensionamento ideal)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (editorMode !== "visual") return;
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Strip inline font-size, font-family and line-height from all elements to match blog scale
      const allElements = doc.querySelectorAll("*");
      allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.fontSize = "";
          el.style.fontFamily = "";
          el.style.lineHeight = "";
          if (el.tagName === "IMG") {
            el.className = "rounded-2xl my-6 max-w-full mx-auto border border-slate-200 dark:border-slate-800 shadow-md";
            el.setAttribute("loading", "lazy");
            el.setAttribute("decoding", "async");
          }
        }
      });

      const cleanHtml = doc.body.innerHTML;
      document.execCommand("insertHTML", false, cleanHtml);
    } else if (text) {
      document.execCommand("insertText", false, text);
    }

    if (editableRef.current) {
      pushToHistory(editableRef.current.innerHTML);
    }
  };

  // Handle click on Links or Images inside contentEditable Visual mode (Edit URLs, Edit Captions)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Check if clicked element or parent is an Image
    const imgElement = target.closest("img") as HTMLImageElement | null;
    if (imgElement) {
      e.preventDefault();
      const figureParent = imgElement.closest("figure");
      const figcaptionEl = figureParent ? figureParent.querySelector("figcaption") : null;
      const currentAlt = imgElement.alt || "";
      const currentCap = figcaptionEl ? figcaptionEl.innerText : "";

      const action = prompt(
        "Opções da Imagem Selecionada:\n\n1 = Editar Legenda & Texto SEO (Alt)\n2 = Redimensionar (100%, 75%, 50%)\n3 = Remover Imagem do Artigo",
        "1"
      );

      if (action === "1") {
        const newAlt = prompt("Texto Alternativo (Alt SEO):", currentAlt);
        if (newAlt !== null) imgElement.alt = newAlt;

        const newCap = prompt("Legenda Visível abaixo da imagem:", currentCap);
        if (newCap !== null) {
          if (newCap.trim().length > 0) {
            if (figcaptionEl) {
              figcaptionEl.innerText = newCap;
            } else if (figureParent) {
              const newFigCap = document.createElement("figcaption");
              newFigCap.className = "text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium italic text-center";
              newFigCap.innerText = newCap;
              figureParent.appendChild(newFigCap);
            } else {
              const newFigure = document.createElement("figure");
              newFigure.className = "my-6 text-center";
              imgElement.replaceWith(newFigure);
              newFigure.appendChild(imgElement);
              const newFigCap = document.createElement("figcaption");
              newFigCap.className = "text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium italic text-center";
              newFigCap.innerText = newCap;
              newFigure.appendChild(newFigCap);
            }
          } else if (figcaptionEl) {
            figcaptionEl.remove();
          }
        }
        if (editableRef.current) pushToHistory(editableRef.current.innerHTML);
      } else if (action === "2") {
        const sizeChoice = prompt(
          "Escolha o tamanho da imagem no artigo:\n\n1 = Largura Total (100%)\n2 = Média (75%)\n3 = Compacta (50%)",
          "1"
        );
        if (sizeChoice === "1") {
          imgElement.style.width = "100%";
        } else if (sizeChoice === "2") {
          imgElement.style.width = "75%";
        } else if (sizeChoice === "3") {
          imgElement.style.width = "50%";
        }
        if (editableRef.current) pushToHistory(editableRef.current.innerHTML);
      } else if (action === "3") {
        if (figureParent) figureParent.remove();
        else imgElement.remove();
        if (editableRef.current) pushToHistory(editableRef.current.innerHTML);
      }
      return;
    }

    // Check if clicked element or parent is a Link
    const linkAnchor = target.closest("a") as HTMLAnchorElement | null;
    if (linkAnchor && linkAnchor.href) {
      e.preventDefault();
      const choice = prompt(
        `Link Selecionado: "${linkAnchor.href}"\n\n1 = Editar o Endereço (URL)\n2 = Abrir Link em Nova Aba\n3 = Remover Link`,
        "1"
      );

      if (choice === "1") {
        const newUrl = prompt("Editar Endereço (URL) do Link:", linkAnchor.getAttribute("href") || "");
        if (newUrl !== null && newUrl.trim().length > 0) {
          linkAnchor.setAttribute("href", newUrl);
          if (editableRef.current) pushToHistory(editableRef.current.innerHTML);
        }
      } else if (choice === "2") {
        window.open(linkAnchor.href, "_blank", "noopener,noreferrer");
      } else if (choice === "3") {
        const textNode = document.createTextNode(linkAnchor.innerText);
        linkAnchor.replaceWith(textNode);
        if (editableRef.current) pushToHistory(editableRef.current.innerHTML);
      }
    }
  };

  // Sync contentEditable innerHTML when value changes externally
  useEffect(() => {
    if (editableRef.current && editorMode === "visual") {
      if (editableRef.current.innerHTML !== value) {
        editableRef.current.innerHTML = value;
      }
    }
  }, [value, editorMode]);

  // Auto-render KaTeX math in Live Preview & Visual Editor
  useEffect(() => {
    if (typeof window === "undefined") return;
    const containers = [
      document.getElementById("editor-live-preview"),
      editableRef.current
    ].filter(Boolean) as HTMLElement[];

    containers.forEach((container) => {
      const mathCardBodies = container.querySelectorAll(".math-card-body");
      mathCardBodies.forEach((el) => {
        const text = el.textContent || "";
        let mathCode = text;
        if (text.includes("$$")) {
          const match = text.match(/\$\$([\s\S]+?)\$\$/);
          if (match && match[1]) mathCode = match[1].trim();
        }
        if (mathCode && !el.querySelector(".katex")) {
          try {
            el.innerHTML = katex.renderToString(mathCode, { displayMode: true, throwOnError: false });
          } catch (e) {}
        }
      });
    });
  }, [value, showPreview, editorMode]);

  // Handle user typing inside contentEditable Visual mode
  const handleEditableInput = () => {
    if (editableRef.current) {
      pushToHistory(editableRef.current.innerHTML);
    }
  };

  // Helper to wrap selected text in HTML tags in Textarea (Code/Markdown mode)
  const insertTagTextarea = (startTag: string, endTag: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${startTag}${selectedText || "Texto aqui"}${endTag}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    pushToHistory(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + (selectedText.length || 10));
    }, 50);
  };

  // Helper to execute formatting in Visual (contentEditable) mode
  const execVisualCommand = (command: string, valueArg: string | undefined = undefined) => {
    document.execCommand(command, false, valueArg);
    if (editableRef.current) {
      pushToHistory(editableRef.current.innerHTML);
    }
  };

  // Insert or Edit Link Prompt
  const handleInsertLink = () => {
    // Check if cursor/selection is currently on an existing link
    if (editorMode === "visual" && editableRef.current) {
      const selection = window.getSelection();
      let existingLink: HTMLAnchorElement | null = null;
      if (selection && selection.anchorNode) {
        const node = selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentNode : selection.anchorNode;
        if (node instanceof HTMLElement) {
          existingLink = node.closest("a");
        }
      }

      if (existingLink) {
        const currentUrl = existingLink.getAttribute("href") || "";
        const newUrl = prompt("Editar Endereço (URL) do Link:", currentUrl);
        if (newUrl !== null) {
          if (newUrl.trim().length > 0) {
            existingLink.setAttribute("href", newUrl);
          } else {
            const textNode = document.createTextNode(existingLink.innerText);
            existingLink.replaceWith(textNode);
          }
          pushToHistory(editableRef.current.innerHTML);
        }
        return;
      }
    }

    const url = prompt("Digite a URL do link (ex: https://exemplo.com):", "https://");
    if (!url) return;

    if (editorMode === "visual" && editableRef.current) {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString() : "";
      if (selectedText && selectedText.trim().length > 0) {
        document.execCommand("createLink", false, url);
      } else {
        const linkText = prompt("Digite o texto visível para o link:", "Acessar Link");
        if (linkText) {
          const aHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 underline font-semibold">${linkText}</a>`;
          document.execCommand("insertHTML", false, aHtml);
        }
      }
      pushToHistory(editableRef.current.innerHTML);
    } else {
      insertTagTextarea(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 underline font-semibold">`, "</a>");
    }
  };

  // Open Image Upload Modal (Computador / URL / Galeria)
  const handleInsertImage = () => {
    setIsImageModalOpen(true);
  };

  // Confirm Image Insertion from Modal (Semantic HTML5 + Lazy Loading + Figcaption)
  const handleConfirmInsertImage = (src: string, alt: string, caption?: string) => {
    let imgHtml = "";
    if (caption && caption.trim().length > 0) {
      imgHtml = `\n<figure class="my-6 text-center">
  <img src="${src}" alt="${alt}" loading="lazy" decoding="async" class="rounded-2xl max-w-full mx-auto border border-slate-200 dark:border-slate-800 shadow-md" />
  <figcaption class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium italic text-center">${caption}</figcaption>
</figure>\n`;
    } else {
      imgHtml = `\n<p class="my-6 text-center">
  <img src="${src}" alt="${alt}" loading="lazy" decoding="async" class="rounded-2xl max-w-full mx-auto border border-slate-200 dark:border-slate-800 shadow-md" />
</p>\n`;
    }
    
    if (editorMode === "visual" && editableRef.current) {
      editableRef.current.focus();
      const prevHtml = editableRef.current.innerHTML;
      try {
        document.execCommand("insertHTML", false, imgHtml);
      } catch (e) {
        // Fallback
      }
      
      if (editableRef.current.innerHTML === prevHtml) {
        editableRef.current.innerHTML = prevHtml + "\n" + imgHtml;
      }
      
      pushToHistory(editableRef.current.innerHTML);
    } else {
      insertTagTextarea(imgHtml);
    }
  };

  // Confirm Icon Insertion from Modal (SVG / Built-in / Emoji)
  const handleConfirmInsertIcon = (htmlSnippet: string) => {
    if (editorMode === "visual" && editableRef.current) {
      editableRef.current.focus();
      const prevHtml = editableRef.current.innerHTML;
      try {
        document.execCommand("insertHTML", false, htmlSnippet);
      } catch (e) {
        // Fallback
      }

      if (editableRef.current.innerHTML === prevHtml) {
        editableRef.current.innerHTML = prevHtml + " " + htmlSnippet;
      }

      pushToHistory(editableRef.current.innerHTML);
    } else {
      insertTagTextarea(htmlSnippet);
    }
  };

  // Universal button action depending on current editor mode
  const handleTagAction = (action: string) => {
    if (editorMode === "visual") {
      switch (action) {
        case "h1": execVisualCommand("formatBlock", "<h1>"); break;
        case "h2": execVisualCommand("formatBlock", "<h2>"); break;
        case "h3": execVisualCommand("formatBlock", "<h3>"); break;
        case "h4": execVisualCommand("formatBlock", "<h4>"); break;
        case "p":  execVisualCommand("formatBlock", "<p>"); break;

        case "bold": execVisualCommand("bold"); break;
        case "italic": execVisualCommand("italic"); break;
        case "underline": execVisualCommand("underline"); break;
        case "strike": execVisualCommand("strikeThrough"); break;
        case "sup": execVisualCommand("superscript"); break;
        case "sub": execVisualCommand("subscript"); break;

        case "code": execVisualCommand("insertHTML", `<code class="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-300 dark:border-slate-700">Texto em Código</code>`); break;
        case "mark": execVisualCommand("insertHTML", `<mark class="bg-yellow-200 dark:bg-yellow-500/40 text-slate-900 dark:text-yellow-200 px-1 rounded">Texto Destacado</mark>`); break;

        case "left": execVisualCommand("justifyLeft"); break;
        case "center": execVisualCommand("justifyCenter"); break;
        case "right": execVisualCommand("justifyRight"); break;
        case "justify": execVisualCommand("justifyFull"); break;

        case "ul": execVisualCommand("insertUnorderedList"); break;
        case "ol": execVisualCommand("insertOrderedList"); break;
        case "quote": execVisualCommand("formatBlock", "<blockquote>"); break;
        case "hr": execVisualCommand("insertHorizontalRule"); break;
      }
    } else {
      switch (action) {
        case "h1": insertTagTextarea("<h1>", "</h1>"); break;
        case "h2": insertTagTextarea("<h2>", "</h2>"); break;
        case "h3": insertTagTextarea("<h3>", "</h3>"); break;
        case "h4": insertTagTextarea("<h4>", "</h4>"); break;
        case "p":  insertTagTextarea("<p>", "</p>"); break;

        case "bold": insertTagTextarea("<strong>", "</strong>"); break;
        case "italic": insertTagTextarea("<em>", "</em>"); break;
        case "underline": insertTagTextarea("<u>", "</u>"); break;
        case "strike": insertTagTextarea("<s>", "</s>"); break;
        case "sup": insertTagTextarea("<sup>", "</sup>"); break;
        case "sub": insertTagTextarea("<sub>", "</sub>"); break;

        case "code": insertTagTextarea('<code class="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs">', "</code>"); break;
        case "mark": insertTagTextarea('<mark class="bg-yellow-200 dark:bg-yellow-500/40 text-slate-900 dark:text-yellow-200 px-1 rounded">', "</mark>"); break;

        case "left": insertTagTextarea('<div style="text-align: left;">', "</div>"); break;
        case "center": insertTagTextarea('<div style="text-align: center;">', "</div>"); break;
        case "right": insertTagTextarea('<div style="text-align: right;">', "</div>"); break;
        case "justify": insertTagTextarea('<div style="text-align: justify;">', "</div>"); break;

        case "ul": insertTagTextarea("<ul>\n  <li>", "</li>\n</ul>"); break;
        case "ol": insertTagTextarea("<ol>\n  <li>", "</li>\n</ol>"); break;
        case "quote": insertTagTextarea('<blockquote class="border-l-4 border-slate-400 pl-4 italic my-4">\n  ', "\n</blockquote>"); break;
        case "hr": insertTagTextarea("\n<hr class=\"my-6 border-0 h-px bg-slate-300 dark:bg-slate-700 opacity-75\" />\n"); break;
      }
    }
  };

  // Helper to change font size of selected text
  const handleFontSize = (sizePx: string) => {
    if (editorMode === "visual" && editableRef.current) {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const spanHtml = `<span style="font-size: ${sizePx};">${selection.toString()}</span>`;
        document.execCommand("insertHTML", false, spanHtml);
      } else {
        const sampleText = prompt("Digite o texto para alterar o tamanho da fonte:", "Texto formatado");
        if (sampleText) {
          const spanHtml = `<span style="font-size: ${sizePx};">${sampleText}</span>`;
          document.execCommand("insertHTML", false, spanHtml);
        }
      }
      pushToHistory(editableRef.current.innerHTML);
    } else {
      insertTagTextarea(`<span style="font-size: ${sizePx};">`, "</span>");
    }
  };

  // Helper to insert special concurseiro callout blocks & interactive design components
  const insertCallout = (type: "dica" | "alerta" | "lei" | "spoiler" | "mnemonico" | "formula" | "grafico" | "fluxograma" | "venn" | "tabela") => {
    let snippet = "";
    if (type === "dica") {
      snippet = `<div class="callout-dica">
  <div class="callout-header">💡 DICA DE PROVA</div>
  <p>Escreva aqui a dica estratégica ou macete para a prova...</p>
</div>`;
    } else if (type === "alerta") {
      snippet = `<div class="callout-pegadinha">
  <div class="callout-header">⚠️ CUIDADO COM A BANCA!</div>
  <p>Cuidado com a troca de termos como 'é vedado' por 'é facultado' nesta hipótese...</p>
</div>`;
    } else if (type === "lei") {
      snippet = `<div class="callout-lei">
  <div class="lei-header">
    <span>📜 CONSTITUIÇÃO FEDERAL — Art. 5º, LVII</span>
    <button onclick="navigator.clipboard.writeText(this.closest('.callout-lei').querySelector('blockquote').innerText)" class="btn-copiar-lei">📋 Copiar</button>
  </div>
  <blockquote>"Ninguém será considerado culpado até o trânsito em julgado de sentença penal condenatória."</blockquote>
</div>`;
    } else if (type === "spoiler") {
      snippet = `<details class="estudo-spoiler">
  <summary>❓ Pergunta de Fixação: Qual o prazo da posse após a nomeação no RJU?</summary>
  <div class="spoiler-conteudo">
    <p>✅ <strong>Resposta:</strong> O prazo é de <strong>30 dias</strong> (improrrogáveis), contados da publicação do ato de provimento (Lei 8.112/90, Art. 13, §1º).</p>
  </div>
</details>`;
    } else if (type === "mnemonico") {
      snippet = `<div class="mnemonico-card">
  <div class="mnemonico-title">🧠 Mnemônico: Princípios Expressos da Adm. Pública (LIMPE)</div>
  <div class="mnemonico-grid">
    <span title="Legalidade"><strong>L</strong>egalidade</span>
    <span title="Impessoalidade"><strong>I</strong>mpessoalidade</span>
    <span title="Moralidade"><strong>M</strong>oralidade</span>
    <span title="Publicidade"><strong>P</strong>ublicidade</span>
    <span title="Eficiência"><strong>E</strong>ficiência</span>
  </div>
</div>`;
    } else if (type === "formula") {
      snippet = `<div class="math-card-block" data-latex="P \\rightarrow Q \\equiv \\neg P \\vee Q">
  <div class="math-card-header">
    <span class="math-badge">⚡ RLM — Equivalência da Condicional</span>
    <button class="btn-copy-math" onclick="navigator.clipboard.writeText('P \\rightarrow Q \\equiv \\neg P \\vee Q')">📋 Copiar LaTeX</button>
  </div>
  <div class="math-card-body">
    $$ P \\rightarrow Q \\equiv \\neg P \\vee Q $$
  </div>
</div>`;
    } else if (type === "grafico") {
      snippet = `<div class="chart-card">
  <div class="chart-title">📊 Incidência deste Assunto na Banca FGV (Últimos 3 Anos)</div>
  <div class="chart-bars">
    <div class="chart-row">
      <span class="chart-label">Atos Administrativos</span>
      <div class="chart-bar-bg"><div class="chart-bar-fill bg-emerald-500" style="width: 85%;"></div></div>
      <span class="chart-val">85% (42 questões)</span>
    </div>
    <div class="chart-row">
      <span class="chart-label">Licitações (Lei 14.133)</span>
      <div class="chart-bar-bg"><div class="chart-bar-fill bg-blue-500" style="width: 65%;"></div></div>
      <span class="chart-val">65% (31 questões)</span>
    </div>
  </div>
</div>`;
    } else if (type === "fluxograma") {
      snippet = `<div class="process-stepper">
  <div class="process-title">🔄 Fases do Processo Administrativo Disciplinar (PAD)</div>
  <div class="stepper-grid">
    <div class="step-card">
      <div class="step-num">1</div>
      <div class="step-text">
        <strong>Instauração</strong>
        <span>Publicação da portaria</span>
      </div>
    </div>
    <div class="step-arrow">➔</div>
    <div class="step-card">
      <div class="step-num">2</div>
      <div class="step-text">
        <strong>Inquérito</strong>
        <span>Instrução, defesa e relatório (60 dias)</span>
      </div>
    </div>
    <div class="step-arrow">➔</div>
    <div class="step-card">
      <div class="step-num">3</div>
      <div class="step-text">
        <strong>Julgamento</strong>
        <span>Decisão (20 dias)</span>
      </div>
    </div>
  </div>
</div>`;
    } else if (type === "venn") {
      snippet = `<div class="venn-diagram-card">
  <div class="venn-title">🔮 Representação Gráfica: "Algum Advogado é Concurseiro"</div>
  <div class="venn-svg-wrapper">
    <svg viewBox="0 0 300 160" class="w-full max-w-sm mx-auto">
      <circle cx="100" cy="80" r="60" class="venn-circle venn-left" />
      <circle cx="200" cy="80" r="60" class="venn-circle venn-right" />
      <text x="70" y="85" class="venn-text">Advogados</text>
      <text x="210" y="85" class="venn-text">Concurseiros</text>
      <text x="145" y="85" class="venn-inter-text">X</text>
    </svg>
  </div>
  <p class="venn-caption">💡 O <strong>"X"</strong> representa a existência de pelo menos um indivíduo que pertence a ambos os conjuntos.</p>
</div>`;
    } else if (type === "tabela") {
      snippet = `<table class="w-full my-6 border-collapse text-xs sm:text-sm">
  <thead>
    <tr class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">
      <th class="p-3 border border-slate-300 dark:border-slate-700">Requisito</th>
      <th class="p-3 border border-slate-300 dark:border-slate-700">Prazo Legal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-3 border border-slate-200 dark:border-slate-800">Posse</td>
      <td class="p-3 border border-slate-200 dark:border-slate-800 font-bold text-emerald-600">30 dias improrrogáveis</td>
    </tr>
  </tbody>
</table>`;
    }

    if (editorMode === "visual" && editableRef.current) {
      document.execCommand("insertHTML", false, snippet);
      pushToHistory(editableRef.current.innerHTML);
    } else {
      if (!textareaRef.current) {
        pushToHistory(value + "\n" + snippet);
        return;
      }
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const newValue = value.substring(0, start) + "\n" + snippet + "\n" + value.substring(start);
      pushToHistory(newValue);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white shadow-xl transition-colors relative">
      
      {/* Sticky Container Wrapper for Header + Toolbar */}
      <div className={`transition-all ${isStickyToolbar ? "sticky top-[64px] sm:top-[80px] lg:top-[126px] z-30 shadow-md backdrop-blur-md bg-white/95 dark:bg-[#070A10]/95 rounded-t-2xl" : ""}`}>
        
        {/* Editor Header Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-[#070A10]/90 flex flex-wrap items-center justify-between gap-3">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-[#0F172A] p-1.5 rounded-xl border border-slate-300 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditorMode("visual")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                editorMode === "visual"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Visual (WYSIWYG)
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("markdown")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                editorMode === "markdown"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> Markdown
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("code")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                editorMode === "code"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-800"
              }`}
            >
              <Code className="w-3.5 h-3.5" /> HTML Puro
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Sticky Toolbar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsStickyToolbar(!isStickyToolbar)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isStickyToolbar
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-white dark:bg-[#1E293B] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-500"
              }`}
              title={isStickyToolbar ? "Menu de edição fixado no topo durante a rolagem" : "Fixar menu de edição no topo ao rolar"}
            >
              <Pin className={`w-3.5 h-3.5 transition-transform ${isStickyToolbar ? "rotate-45" : ""}`} />
              <span>{isStickyToolbar ? "Menu Fixado" : "Fixar Menu"}</span>
            </button>

            {/* Live Preview Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 ${
                showPreview
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                  : "bg-white dark:bg-[#1E293B] border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Ocultar Pré-visualização" : "Pré-visualizar Artigo"}
            </button>
          </div>

        </div>

        {/* Formatting Toolbar */}
        <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#1E293B]/95 flex flex-wrap items-center gap-2">
        
        {/* GRUPO 1: Histórico */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-30"
            title="Desfazer (Ctrl + Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-30"
            title="Refazer (Ctrl + Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClearFormatting}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Limpar Formatação"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* GRUPO 2: Títulos & Níveis */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2">
          <button
            type="button"
            onClick={() => handleTagAction("h1")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors font-extrabold text-xs"
            title="Título Principal H1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("h2")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors font-bold text-xs"
            title="Título de Seção H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("h3")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors text-xs"
            title="Subtítulo H3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("h4")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors text-xs"
            title="Subtítulo H4"
          >
            <Heading4 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("p")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Texto Normal / Parágrafo (P)"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* GRUPO NOVO: Tamanho da Fonte */}
        <div className="flex items-center gap-1.5 border-r border-slate-300 dark:border-slate-700 pr-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">Fonte:</label>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                handleFontSize(e.target.value);
                e.target.value = "";
              }
            }}
            className="px-2 py-1 rounded-lg bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            title="Alterar Tamanho da Fonte do Texto Selecionado"
          >
            <option value="" disabled>Tamanho...</option>
            <option value="12px">Pequeno (12px)</option>
            <option value="14px">Padrão (14px)</option>
            <option value="18px">Médio (18px)</option>
            <option value="20px">Grande (20px)</option>
            <option value="24px">Destaque (24px)</option>
            <option value="30px">Gigante (30px)</option>
          </select>
        </div>

        {/* GRUPO 3: Estilização de Texto */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2">
          <button
            type="button"
            onClick={() => handleTagAction("bold")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors font-bold"
            title="Negrito (Strong)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("italic")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors italic"
            title="Itálico (Em)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("underline")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors underline"
            title="Sublinhado (U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("strike")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors line-through"
            title="Tachado / Riscado (S)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("sup")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Sobrescrito (Sup)"
          >
            <Superscript className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("sub")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Subscrito (Sub)"
          >
            <Subscript className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("mark")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Marca-Texto / Destaque Amarelo (Mark)"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("code")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Código em Linha (Code)"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* GRUPO 4: Alinhamento de Parágrafo */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2">
          <button
            type="button"
            onClick={() => handleTagAction("left")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Alinhar à Esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("center")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("right")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Alinhar à Direita"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("justify")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Justificar Texto"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* GRUPO 5: Listas & Inserções */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2">
          <button
            type="button"
            onClick={() => handleTagAction("ul")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Lista com Marcadores (UL)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("ol")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Lista Numerada (OL)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("quote")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Citação (Blockquote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleTagAction("hr")}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Linha Divisória Horizontal (HR)"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Inserir / Editar Link (A)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Inserir Imagem do Computador ou URL"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsIconModalOpen(true)}
            className="p-1.5 rounded-lg bg-white dark:bg-[#0F172A] text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Inserir Ícone Vetorial / SVG Personalizado"
          >
            <Shapes className="w-4 h-4" />
          </button>
        </div>

        {/* GRUPO 6: Caixas Especiais & Elementos Interativos de Estudo */}
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Elementos Interativos:
          </span>

          <button
            type="button"
            onClick={() => setIsIconModalOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-md hover:brightness-110 transition-all flex items-center gap-1 cursor-pointer"
            title="Inserir Ícones Vetoriais ou SVG Customizado"
          >
            <Shapes className="w-4 h-4 shrink-0" /> Ícones / SVG
          </button>

          <button
            type="button"
            onClick={() => insertCallout("dica")}
            className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 text-xs font-black shadow-md hover:opacity-90 transition-all flex items-center gap-1"
            title="Inserir caixa Dica de Prova"
          >
            <DicaGradientIcon className="w-4 h-4 shrink-0" /> Dica de Prova
          </button>

          <button
            type="button"
            onClick={() => insertCallout("alerta")}
            className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md hover:bg-amber-400 transition-all flex items-center gap-1"
            title="Inserir caixa Pegadinha da Banca"
          >
            <PegadinhaGradientIcon className="w-4 h-4 shrink-0" /> Pegadinha
          </button>

          <button
            type="button"
            onClick={() => insertCallout("lei")}
            className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-xs font-black shadow-md hover:bg-purple-500 transition-all flex items-center gap-1"
            title="Inserir citação de Dispositivo Legal com Copiador"
          >
            <LeiGradientIcon className="w-4 h-4 shrink-0" /> Artigo de Lei
          </button>

          <button
            type="button"
            onClick={() => insertCallout("spoiler")}
            className="px-2.5 py-1 rounded-xl bg-teal-600 text-white text-xs font-black shadow-md hover:bg-teal-500 transition-all flex items-center gap-1"
            title="Inserir Pergunta / Resposta Sanfonada (Evocação Ativa)"
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" /> Pergunta Spoiler
          </button>

          <button
            type="button"
            onClick={() => insertCallout("mnemonico")}
            className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-md hover:bg-indigo-500 transition-all flex items-center gap-1"
            title="Inserir Card Mnemônico Interativo"
          >
            <BrainGradientIcon className="w-4 h-4 shrink-0" /> Mnemônico
          </button>

          <button
            type="button"
            onClick={() => insertCallout("formula")}
            className="px-2.5 py-1 rounded-xl bg-slate-900 text-emerald-400 border border-emerald-500/50 text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1"
            title="Inserir Card de Fórmula Matemática / RLM (KaTeX)"
          >
            <MathGradientIcon className="w-4 h-4 shrink-0" /> Fórmula KaTeX
          </button>

          <button
            type="button"
            onClick={() => insertCallout("grafico")}
            className="px-2.5 py-1 rounded-xl bg-cyan-700 text-white text-xs font-bold hover:bg-cyan-600 transition-all flex items-center gap-1"
            title="Inserir Gráfico de Incidência de Temas na Banca"
          >
            <BarChart2 className="w-3.5 h-3.5 shrink-0" /> Incidência
          </button>

          <button
            type="button"
            onClick={() => insertCallout("fluxograma")}
            className="px-2.5 py-1 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-1"
            title="Inserir Fluxograma de Processo Stepper"
          >
            <GitMerge className="w-3.5 h-3.5 shrink-0" /> Fluxograma
          </button>

          <button
            type="button"
            onClick={() => insertCallout("venn")}
            className="px-2.5 py-1 rounded-xl bg-violet-700 text-white text-xs font-bold hover:bg-violet-600 transition-all flex items-center gap-1"
            title="Inserir Diagrama de Venn para Raciocínio Lógico"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" /> Diagrama Venn
          </button>

          <button
            type="button"
            onClick={() => insertCallout("tabela")}
            className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 transition-all flex items-center gap-1"
            title="Inserir Tabela de Prazos/Requisitos"
          >
            <TableIcon className="w-3.5 h-3.5 shrink-0" /> Tabela
          </button>
        </div>
      </div>
    </div>

      {/* Main Editing Area + Optional Live Preview */}
      <div className={`grid ${showPreview ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-[360px]`}>
        
        {/* Editor Area: VISUAL (contentEditable) vs CODE / MARKDOWN (Textarea) */}
        <div 
          ref={leftPanelRef}
          onScroll={handleEditorScroll}
          className={`p-4 relative bg-white dark:bg-[#0B0F19] ${
            showPreview ? "h-[520px] max-h-[520px] overflow-y-auto" : ""
          }`}
        >
          {editorMode === "visual" ? (
            <div
              ref={editableRef}
              contentEditable={true}
              onInput={handleEditableInput}
              onKeyDown={handleKeyDown}
              onClick={handleCanvasClick}
              onPaste={handlePaste}
              suppressContentEditableWarning={true}
              className="w-full h-full min-h-[320px] text-slate-900 dark:text-white focus:outline-none prose dark:prose-invert editor-canvas max-w-none leading-relaxed font-sans cursor-text"
              data-placeholder="Escreva seu artigo visualmente aqui..."
            />
          ) : (
            <textarea
              ref={textareaRef}
              rows={14}
              value={value}
              onChange={(e) => pushToHistory(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
              placeholder="Escreva ou cole seu código/markdown aqui..."
              className={`w-full bg-transparent text-sm sm:text-base font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none leading-relaxed ${
                showPreview ? "h-full min-h-[480px] overflow-y-auto resize-none" : "h-full min-h-[320px] resize-y"
              }`}
            />
          )}
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div 
            ref={previewScrollRef}
            onScroll={handlePreviewScroll}
            id="editor-live-preview" 
            className="p-5 bg-slate-50 dark:bg-[#070A10] overflow-y-auto max-h-[520px] h-[520px] space-y-4 border-t md:border-t-0"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Pré-visualização do Artigo no Site:
              </div>
              <button
                type="button"
                onClick={() => setIsSyncScrollActive(!isSyncScrollActive)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  isSyncScrollActive
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                }`}
                title={isSyncScrollActive ? "Rolagem sincronizada entre editor e pré-visualização ATIVA" : "Ativar rolagem sincronizada"}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncScrollActive ? "text-emerald-500" : ""}`} />
                <span>{isSyncScrollActive ? "Rolagem Sincronizada" : "Sincronizar Rolagem"}</span>
              </button>
            </div>
            <div 
              className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200"
              dangerouslySetInnerHTML={{ __html: value || "<p class='text-slate-400 dark:text-slate-500 italic'>O conteúdo formatado aparecerá aqui...</p>" }}
            />
          </div>
        )}

      </div>

      {/* Editor Footer Status */}
      <div className="px-4 py-2.5 bg-slate-100 dark:bg-[#070A10] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Dica: Clique em qualquer <strong className="text-emerald-600 dark:text-emerald-400">Imagem</strong> ou <strong className="text-emerald-600 dark:text-emerald-400">Link</strong> no texto para editar legendas ou URLs!</span>
        <span>
          {(() => {
            const cleanText = (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
            const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
            const readMins = Math.max(1, Math.ceil(wordCount / 200));
            return `${cleanText.length} caracteres de texto • ~${readMins} min de leitura`;
          })()}
        </span>
      </div>

      {/* Image Upload Modal Dialog */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={handleConfirmInsertImage}
      />

      {/* Icon Picker Modal Dialog */}
      <IconPickerModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onInsertIcon={handleConfirmInsertIcon}
      />

    </div>
  );
}
