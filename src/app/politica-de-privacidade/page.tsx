import React from "react";
import { ShieldCheck } from "lucide-react";

export default function PoliticaPrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Conformidade LGPD & AdSense
        </span>
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
          Política de Privacidade
        </h1>
        <p className="text-xs text-slate-500">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          A sua privacidade é fundamental para o portal <strong>Concurseiro Focado</strong>. Esta política detalha como coletamos, usamos e protegemos as suas informações pessoais em conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018).
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">1. Coleta de Dados Pessoais</h2>
        <p>
          Coletamos informações fornecidas voluntariamente no cadastro de membros (nome, e-mail) para permitir o login, salvamento de preferências do 'Modo Foco' e acesso a recursos exclusivos.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">2. Google AdSense e Cookies</h2>
        <p>
          O Google, como fornecedor de terceiros, utiliza cookies para veicular anúncios neste site. Os usuários podem optar por não usar o cookie DART visitando a política de privacidade da rede de conteúdo e dos anúncios do Google. Membros autenticados não recebem anúncios AdSense.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">3. Seus Direitos (LGPD)</h2>
        <p>
          Você tem o direito de solicitar a exportação ou exclusão definitiva de seus dados a qualquer momento através da página de contato.
        </p>
      </div>
    </div>
  );
}
