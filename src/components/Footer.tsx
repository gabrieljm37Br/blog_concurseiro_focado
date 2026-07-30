import React from "react";
import Link from "next/link";
import { Target, Heart, ShieldCheck, Mail, FileText, Send } from "lucide-react";
import YouTubeIcon from "@/components/icons/YouTubeIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand, Mission & Redes Sociais */}
          <div className="space-y-4 md:col-span-1">
            <Logo showTagline={true} forceDarkTheme={true} />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
              Estudo ativo na prática. Compartilhando técnicas de aprendizagem, rotina, mapas mentais, simulados e ferramentas de gestão de estudo para concurseiros.
            </p>
            
            {/* Redes Sociais no Rodapé */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Nossas Redes Sociais:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-600/30 transition-colors"
                  title="Canal no YouTube"
                >
                  <YouTubeIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>YouTube</span>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600/20 text-pink-400 border border-pink-500/30 text-xs font-semibold hover:bg-pink-600/30 transition-colors"
                  title="Perfil no Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Instagram</span>
                </a>

                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
                  title="Comunidade no Telegram"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

          </div>

          {/* Col 2: Seções do Portal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/estude/direito-constitucional" className="hover:text-emerald-400 transition-colors">
                  Estude Disciplinas
                </Link>
              </li>
              <li>
                <Link href="/aprenda" className="hover:text-emerald-400 transition-colors">
                  Técnicas de Aprendizagem
                </Link>
              </li>
              <li>
                <Link href="/estude-comigo" className="hover:text-emerald-400 transition-colors">
                  Vídeos Estude comigo
                </Link>
              </li>
              <li>
                <Link href="/informe-se" className="hover:text-emerald-400 transition-colors">
                  Notícias & Editais
                </Link>
              </li>
              <li>
                <Link href="/loja" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-400">
                  Loja de APPs & Ferramentas
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Área de Membros */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Comunidade & Membros
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/membros/login" className="hover:text-emerald-400 transition-colors font-semibold">
                  Área de Membros Grátis
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-xs block">
                  ✓ Sem Anúncios AdSense para membros
                </span>
              </li>
              <li>
                <span className="text-slate-400 text-xs block">
                  ✓ Leitura no Modo Foco
                </span>
              </li>
              <li>
                <span className="text-slate-400 text-xs block">
                  ✓ Flashcards & Simulados acoplados
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Links Obrigatórios AdSense & Contato */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Institucional (Transparência)
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Sobre o Autor
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Concurseiro Focado. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> para estudantes de alta performance.
          </p>
        </div>
      </div>
    </footer>
  );
}
