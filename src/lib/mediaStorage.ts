import { supabase } from "@/lib/supabaseClient";

export const ARTICLE_MEDIA_BUCKET = "article-media";

export interface OptimizedImageUploadResult {
  url: string;
  storageUploaded: boolean;
  path?: string;
}

/**
 * Converte um arquivo de imagem no navegador para WebP (máx. 1200px, qualidade 82%),
 * retornando tanto o Blob quanto o Data URI de fallback.
 */
export function compressImageToWebpClient(
  file: File,
  maxDimension: number = 1200,
  quality: number = 0.82
): Promise<{ blob: Blob | null; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo de imagem."));
    reader.onload = (event) => {
      const originalDataUrl = String(event.target?.result || "");
      const img = new Image();
      img.onerror = () => resolve({ blob: null, dataUrl: originalDataUrl });
      img.onload = () => {
        const canvas = document.createElement("canvas");
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

        if (!ctx) {
          resolve({ blob: null, dataUrl: originalDataUrl });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const webpDataUrl = canvas.toDataURL("image/webp", quality);

        canvas.toBlob(
          (blob) => {
            resolve({ blob, dataUrl: webpDataUrl });
          },
          "image/webp",
          quality
        );
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function sanitizeFileStem(name: string): string {
  return name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "imagem";
}

/**
 * Comprime a imagem para WebP e tenta enviá-la ao Supabase Storage (`article-media`).
 * Caso o bucket ainda não esteja criado ou falhe por rede/permissão, realiza fallback
 * automático e silencioso para Data URI WebP sem interromper a publicação editorial.
 */
export async function uploadOptimizedArticleImage(
  file: File,
  folder: "covers" | "content" = "content"
): Promise<OptimizedImageUploadResult> {
  const { blob, dataUrl } = await compressImageToWebpClient(file);

  if (!blob) {
    return { url: dataUrl, storageUploaded: false };
  }

  try {
    const safeStem = sanitizeFileStem(file.name);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `${folder}/${safeStem}-${uniqueSuffix}.webp`;

    const { error } = await supabase.storage
      .from(ARTICLE_MEDIA_BUCKET)
      .upload(filePath, blob, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      console.warn("Storage upload fallback para Data URI:", error.message);
      return { url: dataUrl, storageUploaded: false };
    }

    const { data: publicUrlData } = supabase.storage
      .from(ARTICLE_MEDIA_BUCKET)
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      return {
        url: publicUrlData.publicUrl,
        storageUploaded: true,
        path: filePath,
      };
    }
  } catch (err) {
    console.warn("Falha inesperada no upload Storage; usando fallback Data URI:", err);
  }

  return { url: dataUrl, storageUploaded: false };
}
