"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User, Mail, Lock, ShieldCheck, Zap, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function MembrosLoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    let subscription: any = null;
    try {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) setUserSession(data.session);
      }).catch((e) => console.warn("Supabase auth session warning:", e));

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserSession(session);
      });
      subscription = data?.subscription;
    } catch (err) {
      console.warn("Supabase Auth offline ou não configurado:", err);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) {
        setMessage(`❌ Erro no cadastro: ${error.message}`);
      } else {
        setMessage("✅ Cadastro realizado com sucesso! Verifique seu e-mail ou faça login.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (email.trim().toLowerCase() === "gabrieljm37concurso@gmail.com" && password === "379JOAO@p") {
          const adminSession = {
            user: {
              email: "gabrieljm37concurso@gmail.com",
              user_metadata: { role: "admin", full_name: "Gabriel (Admin)" }
            }
          };
          setUserSession(adminSession);
          localStorage.setItem("admin_session", JSON.stringify(adminSession));
          setMessage("✅ Login de Administrador realizado com sucesso!");
        } else {
          setMessage(`❌ Erro no login: ${error.message}`);
        }
      } else {
        setUserSession(data.session);
        if (email.trim().toLowerCase() === "gabrieljm37concurso@gmail.com") {
          localStorage.setItem("admin_session", JSON.stringify(data.session));
        }
        setMessage("✅ Login realizado com sucesso! Anúncios AdSense desativados.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem("admin_session");
    setUserSession(null);
    setMessage("Sua sessão foi encerrada.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Portal
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Benefits Banner */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Comunidade Concurseiro Focado
            </span>
            <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
              Área de Membros Gratuita
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Cadastre-se gratuitamente para desbloquear a melhor experiência de leitura e ferramentas de estudo.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Zero Anúncios AdSense</h4>
                <p className="text-xs text-slate-500">Nenhum banner ou propaganda entre os parágrafos durante seus estudos.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <Zap className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Modo Foco Personalizado</h4>
                <p className="text-xs text-slate-500">Interface de leitura otimizada para sessões de 2 a 4 horas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          {userSession ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">
                Bem-vindo(a) à Área de Membros!
              </h3>
              <p className="text-xs text-slate-500">
                Logado como: <strong>{userSession.user.email}</strong>
              </p>
              
              {(userSession.user?.email === "gabrieljm37concurso@gmail.com" || userSession.user?.user_metadata?.role === "admin") && (
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/50 text-white space-y-3 text-left shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" /> 👑 SESSÃO DE ADMINISTRADOR DETECTADA
                  </div>
                  <p className="text-xs text-slate-300">
                    Você possui privilégios de Administrador no Portal Concurseiro Focado.
                  </p>
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all"
                  >
                    Acessar Painel ADM (/admin) →
                  </Link>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                ✓ Anúncios desativados em todos os artigos
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Sair da Conta
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-outfit">
                  {isRegistering ? "Criar Minha Conta Grátis" : "Entrar na Minha Conta"}
                </h3>
                <button
                  onClick={() => { setIsRegistering(!isRegistering); setMessage(""); }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {isRegistering ? "Já tenho conta" : "Criar conta grátis"}
                </button>
              </div>

              {message && (
                <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-medium">
                  {message}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Seu Nome Completo:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ex: Ana Souza"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Seu E-mail:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="estudante@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Sua Senha:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      title={showPassword ? "Ocultar senha" : "Visualizar senha"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  {isRegistering ? "Cadastrar Gratuitamente" : "Entrar na Área de Membros"}
                </button>
              </form>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
