"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, User, Key, Eye, EyeOff, Lock } from "lucide-react";

interface AdminAuthGateProps {
  isCheckingAuth: boolean;
  adminEmail: string;
  setAdminEmail: (val: string) => void;
  adminPassword: string;
  setAdminPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  authError: string;
  isSubmittingLogin: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdminAuthGate({
  isCheckingAuth,
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  showPassword,
  setShowPassword,
  authError,
  isSubmittingLogin,
  onSubmit,
}: AdminAuthGateProps) {
  if (isCheckingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 animate-pulse mx-auto" />
          <p className="text-sm font-semibold text-slate-400">
            Verificando credenciais de administrador...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white">
            Acesso Administrativo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Faça login com sua conta de administrador para gerenciar o blog Concurseiro Focado.
          </p>
        </div>

        {authError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
            {authError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-500" /> E-mail do Administrador
            </label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@concurseirofocado.com.br"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-emerald-500" /> Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            disabled={isSubmittingLogin}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmittingLogin ? "Autenticando..." : "Entrar no Painel ADM"}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-emerald-500">
            ← Voltar ao Portal Público
          </Link>
        </div>
      </div>
    </div>
  );
}
