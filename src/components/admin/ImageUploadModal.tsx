"use client";

import React, { useState } from "react";
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, FileImage, Sparkles, Zap } from "lucide-react";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (src: string, alt: string, caption?: string) => void;
}

export default function ImageUploadModal({ isOpen, onClose, onInsertImage }: ImageUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "gallery">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  if (!isOpen) return null;

  // Gallery of high-quality sample concurseiro study graphics
  const sampleGallery = [
    {
      title: "Infográfico de Direito Constitucional (Direitos Fundamentais)",
      url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Mapa Mental de Raciocínio Lógico (Tabela Verdade)",
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Cronograma e Rotina de Estudos de Alta Performance",
      url: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Esquema Didático - Lei 8.112/90",
      url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  // Automatic Client-Side Image Compression to WebP (1200px max width, 82% quality)
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).");
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL("image/webp", 0.82);
          setPreviewSrc(webpDataUrl);
        } else {
          setPreviewSrc(event.target?.result as string);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
      if (!imageAlt) setImageAlt(file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleConfirmInsert = () => {
    let finalSrc = "";
    if (activeTab === "upload" && previewSrc) {
      finalSrc = previewSrc;
    } else if (activeTab === "url" && imageUrl) {
      finalSrc = imageUrl;
    }

    if (!finalSrc) {
      alert("Por favor, selecione ou insira uma imagem antes de confirmar.");
      return;
    }

    onInsertImage(finalSrc, imageAlt || "Imagem do Artigo", imageCaption);
    onClose();
    // Reset state
    setPreviewSrc(null);
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0B0F19]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Inserir Imagem Otimizada
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otimização automática de performance, SEO e suporte a legendas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#0F172A] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "upload"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Upload className="w-4 h-4" /> Upload do Computador
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "url"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <LinkIcon className="w-4 h-4" /> Link da Internet
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "gallery"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Galeria Sugerida
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-5">
          
          {/* TAB 1: UPLOAD DO COMPUTADOR */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-900/40"
                }`}
              >
                {isCompressing ? (
                  <div className="space-y-2 py-4 flex flex-col items-center">
                    <Zap className="w-8 h-8 text-emerald-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Otimizando e convertendo imagem para WebP...
                    </p>
                  </div>
                ) : previewSrc ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <img
                      src={previewSrc}
                      alt="Pré-visualização da Imagem Local"
                      className="max-h-44 rounded-xl object-contain border border-slate-200 dark:border-slate-800 shadow-md"
                    />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Convertida para WebP leve & pronta!
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <FileImage className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Arraste e solte uma imagem aqui
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Será convertida automaticamente para <strong>WebP ultra-leve</strong>
                      </p>
                    </div>

                    <label className="mt-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Escolher Arquivo do Computador
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Alt Text & Caption Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Texto Alternativo (Alt SEO)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Ex: Esquema didático do Art. 5º CF/88"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Legenda Visível (`figcaption`)
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Ex: Figura 1: Quadro comparativo de prazos"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LINK DA INTERNET */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  URL da Imagem na Web
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Texto Alternativo (Alt SEO)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Ex: Infográfico ilustrativo"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Legenda Visível (`figcaption`)
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Ex: Fonte: Cebraspe 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {imageUrl && (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Pré-visualização do Link:</span>
                  <img
                    src={imageUrl}
                    alt="Preview URL"
                    onError={() => alert("Não foi possível carregar a imagem desta URL. Verifique o link.")}
                    className="max-h-40 rounded-lg object-contain border border-slate-300 dark:border-slate-700"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GALERIA SUGERIDA */}
          {activeTab === "gallery" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Clique em uma imagem da galeria para inseri-la instantaneamente no artigo:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleGallery.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onInsertImage(item.url, item.title, "Esquema ilustrativo do portal Concurseiro Focado");
                      onClose();
                    }}
                    className="group border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-left hover:border-emerald-500 transition-all hover:shadow-lg bg-slate-50 dark:bg-slate-900"
                  >
                    <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            Cancelar
          </button>

          {activeTab !== "gallery" && (
            <button
              type="button"
              onClick={handleConfirmInsert}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Inserir Imagem Otimizada
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
