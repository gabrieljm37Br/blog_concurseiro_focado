import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/data/mockPosts";
import { Clock, Layers, HelpCircle, ArrowUpRight, Sparkles } from "lucide-react";
import YouTubeIcon from "@/components/icons/YouTubeIcon";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Estude":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "Aprenda":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Assista":
        return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800";
      case "Informe-se":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <article className="group bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      
      {/* Image Thumbnail Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Category & YouTube Badges Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md shadow-sm ${getCategoryBadgeColor(post.category)}`}>
            {post.category}
          </span>
          {post.youtubeVideoId && (
            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-600 text-white flex items-center gap-1 shadow-sm">
              <YouTubeIcon className="w-3.5 h-3.5" /> Video
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Metadata Subcategory or Banca */}
          {(post.subcategory || post.banca) && (
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {post.subcategory} {post.banca ? `• Banca ${post.banca}` : ""}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            <Link href={`/artigo/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          {/* Summary */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {post.summary}
          </p>
        </div>

        {/* Interactive Features & Read Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          
          {/* Study Badges */}
          <div className="flex items-center gap-3">
            {post.category === "Estude" ? (
              <>
                {post.flashcardsCount && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold" title={`${post.flashcardsCount} Flashcards inclusos`}>
                    <Layers className="w-3.5 h-3.5" /> {post.flashcardsCount} cards
                  </span>
                )}
                {post.questionsCount && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold" title={`${post.questionsCount} Questões resolvidas`}>
                    <HelpCircle className="w-3.5 h-3.5" /> {post.questionsCount} quest.
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold" title="Infográfico disponível neste artigo">
                <Sparkles className="w-3.5 h-3.5" /> Infográfico
              </span>
            )}
          </div>

          {/* Read Article Arrow Link */}
          <Link
            href={`/artigo/${post.slug}`}
            className="inline-flex items-center gap-0.5 font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
          >
            Ler <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

        </div>

      </div>

    </article>
  );
}
