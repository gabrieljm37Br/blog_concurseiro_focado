import { MetadataRoute } from "next";
import { MOCK_POSTS } from "@/data/mockPosts";

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

  const articleRoutes: MetadataRoute.Sitemap = MOCK_POSTS.map((post) => ({
    url: `${baseUrl}/artigo/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...articleRoutes];
}
