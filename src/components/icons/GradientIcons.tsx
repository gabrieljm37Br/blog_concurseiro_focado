import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * 💡 Ícone Duotone/Gradiente para Dica de Prova (Lâmpada Esmeralda/Ouro)
 */
export function DicaGradientIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dicaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="dicaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"
        fill="url(#dicaGlow)"
        stroke="url(#dicaGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 21h6" stroke="url(#dicaGradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 17h4" stroke="url(#dicaGradient)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * ⚠️ Ícone Duotone/Gradiente para Pegadinha da Banca (Triângulo de Alerta Âmbar/Fogo)
 */
export function PegadinhaGradientIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pegadinhaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="pegadinhaBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        fill="url(#pegadinhaBg)"
        stroke="url(#pegadinhaGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 9v4" stroke="url(#pegadinhaGradient)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="#f59e0b" />
    </svg>
  );
}

/**
 * 📜 Ícone Duotone/Gradiente para Dispositivo Legal / Vade Mecum (Livro/Pergaminho Púrpura)
 */
export function LeiGradientIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="leiBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="url(#leiGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        fill="url(#leiBg)"
        stroke="url(#leiGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 7h8M8 11h6" stroke="url(#leiGradient)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 🧠 Ícone Duotone/Gradiente para Mnemônicos & Cérebro de Estudo (Índigo/Ciano)
 */
export function BrainGradientIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="brainBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M12 4.5a3.5 3.5 0 0 0-3.5 3.5c0 .35.05.69.15 1A3.5 3.5 0 0 0 5 12a3.5 3.5 0 0 0 1.5 2.87C6.17 15.35 6 15.91 6 16.5A3.5 3.5 0 0 0 9.5 20c1.17 0 2.21-.58 2.85-1.47A3.5 3.5 0 0 0 15 20a3.5 3.5 0 0 0 3.5-3.5c0-.59-.17-1.15-.5-1.63A3.5 3.5 0 0 0 19 12a3.5 3.5 0 0 0-3.65-3.5c.1-.31.15-.65.15-1A3.5 3.5 0 0 0 12 4.5z"
        fill="url(#brainBg)"
        stroke="url(#brainGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 4.5v14" stroke="url(#brainGrad)" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * ⚡ Ícone Duotone/Gradiente para Fórmulas de RLM & Matemática (Esmeralda/Neon)
 */
export function MathGradientIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#0b0f19" stroke="url(#mathGrad)" strokeWidth="2" />
      <path d="M7 9h3l2 6 2-8h3" stroke="url(#mathGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
