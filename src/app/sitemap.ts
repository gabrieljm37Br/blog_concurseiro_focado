import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://concurseirofocado.com.br";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/aprenda",
    "/estude-comigo",
    "/informe-se",
    "/rotina",
    "/loja",
    "/sobre",
    "/contato",
    "/termos-de-uso",
    "/politica-de-privacidade",
    "/membros/login",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at, created_at")
      .eq("is_published", true);

    if (posts && posts.length > 0) {
      articleRoutes = posts.map((post) => ({
        url: `${baseUrl}/artigo/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at || Date.now()),
        changeFrequency: "weekly",
        priority: 0.9,
      }));
    }
  } catch (e) {
    console.warn("Erro ao gerar sitemap dinâmico:", e);
  }

  return [...staticRoutes, ...articleRoutes];
}
