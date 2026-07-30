"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "icon" | "stacked";
  showTagline?: boolean;
  className?: string;
  forceDarkTheme?: boolean;
}

export function LogoIcon({ 
  className = "w-9 h-9 sm:w-10 sm:h-10",
  forceDarkTheme = false
}: { 
  className?: string;
  forceDarkTheme?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${forceDarkTheme ? "logo-forced-dark" : "logo-svg-icon"}`}
    >
      {/* Outer Target Ring */}
      <circle
        cx="42"
        cy="52"
        r="34"
        strokeWidth="10"
        stroke={forceDarkTheme ? "#FFFFFF" : undefined}
        className={forceDarkTheme ? "" : "stroke-[#0F172A] dark:stroke-white"}
      />

      {/* Inner Emerald Green Ring */}
      <circle
        cx="42"
        cy="52"
        r="21"
        stroke="#10B981"
        strokeWidth="8"
      />

      {/* Center Bullseye Dot */}
      <circle
        cx="42"
        cy="52"
        r="6"
        fill={forceDarkTheme ? "#FFFFFF" : undefined}
        className={forceDarkTheme ? "" : "fill-[#0F172A] dark:fill-white"}
      />

      {/* Target Cutout Gap for Pencil */}
      <path
        d="M 42 52 L 72 22"
        strokeWidth="8"
        strokeLinecap="round"
        stroke={forceDarkTheme ? "#0F172A" : undefined}
        className={forceDarkTheme ? "" : "stroke-[#F8FAFC] dark:stroke-[#0B0F19]"}
      />

      {/* Pencil Body */}
      <path
        d="M 52 42 L 80 14 C 82 12 85 12 87 14 L 90 17 C 92 19 92 22 90 24 L 62 52 Z"
        fill={forceDarkTheme ? "#F8FAFC" : undefined}
        className={forceDarkTheme ? "" : "fill-[#1E293B] dark:fill-slate-100"}
      />

      {/* Pencil Silver Ring */}
      <path
        d="M 76 18 L 84 26"
        strokeWidth="3"
        stroke={forceDarkTheme ? "#CBD5E1" : undefined}
        className={forceDarkTheme ? "" : "stroke-[#94A3B8] dark:stroke-slate-400"}
      />

      {/* Pencil Gold Tip pointing into bullseye center */}
      <polygon
        points="44,50 56,40 50,56"
        fill="#F59E0B"
      />
      <polygon
        points="44,50 48,46 46,48"
        fill={forceDarkTheme ? "#0F172A" : undefined}
        className={forceDarkTheme ? "" : "fill-[#0F172A] dark:fill-[#0B0F19]"}
      />
    </svg>
  );
}

export default function Logo({
  variant = "full",
  showTagline = true,
  className = "",
  forceDarkTheme = false
}: LogoProps) {
  if (variant === "icon") {
    return <LogoIcon className={className || "w-9 h-9 sm:w-10 sm:h-10"} forceDarkTheme={forceDarkTheme} />;
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 sm:gap-3 group shrink-0 ${className}`}>
      {/* Target & Pencil Icon */}
      <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
        <LogoIcon className="w-9 h-9 sm:w-10 sm:h-10" forceDarkTheme={forceDarkTheme} />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center text-left">
        <div className="flex flex-col font-outfit font-extrabold tracking-tight leading-tight">
          <span className={`text-base sm:text-lg uppercase tracking-wider ${forceDarkTheme ? "text-white" : "text-slate-900 dark:text-white"}`}>
            CONCURSEIRO
          </span>
          <span className={`text-base sm:text-lg uppercase tracking-wider -mt-1 ${forceDarkTheme ? "text-emerald-400" : "text-emerald-500 dark:text-emerald-400"}`}>
            FOCADO
          </span>
        </div>

        {showTagline && (
          <span className={`hidden sm:block text-[10px] sm:text-[11px] font-semibold mt-0.5 tracking-tight font-sans ${forceDarkTheme ? "text-slate-300" : "text-slate-500 dark:text-slate-300"}`}>
            Dicas • Materiais • Aprovação
          </span>
        )}
      </div>
    </Link>
  );
}
