import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-5">
      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-extrabold uppercase tracking-wider">
        Erro 404
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-outfit">
        Artigo não encontrado
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        O artigo solicitado não existe, ainda não foi publicado ou foi removido do portal.
      </p>
      <Link
        href="/"
        className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
      >
        ← Voltar ao Portal
      </Link>
    </div>
  );
}
