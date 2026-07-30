import React from "react";
import { FileText } from "lucide-react";

export default function TermosUsoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> Termos Gerais
        </span>
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
          Termos de Uso
        </h1>
        <p className="text-xs text-slate-500">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          Ao acessar e utilizar o portal <strong>Concurseiro Focado</strong>, você concorda em cumprir e aceitar os seguintes termos e condições de uso.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">1. Direitos Autorais e Conteúdo</h2>
        <p>
          Todo o conteúdo didático, resumos, esquemas e código-fonte dos aplicativos disponibilizados no blog pertencem ao autor do projeto Concurseiro Focado, salvo indicação em contrário. É permitida a reprodução para estudo pessoal sem fins comerciais.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">2. Isenção de Responsabilidade</h2>
        <p>
          Os artigos têm caráter educativo e informativo. Recomenda-se sempre a consulta aos editais oficiais e fontes legislativas atualizadas.
        </p>
      </div>
    </div>
  );
}
