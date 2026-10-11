"use client";

import React from "react";
import { ArrowRight, GitFork } from "lucide-react";

export interface ProcessStep {
  number: string | number;
  title: string;
  description: string;
  active?: boolean;
}

interface ProcessStepperProps {
  title?: string;
  steps: ProcessStep[];
  variant?: "horizontal" | "vertical";
  className?: string;
}

export function ProcessStepper({
  title = "🔄 TRILHA DE APRENDIZAGEM / PASSO A PASSO",
  steps,
  variant = "horizontal",
  className = "",
}: ProcessStepperProps) {
  if (variant === "vertical") {
    return (
      <section className={`process-stepper ${className}`} aria-label={title}>
        <div className="process-title">
          <GitFork className="w-5 h-5" />
          <span>{title}</span>
        </div>
        <div className="stepper-vertical">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className={`step-card ${step.active ? "active" : ""}`}>
                <div className="step-num">{step.number}</div>
                <div>
                  <strong className="block text-sm font-bold">{step.title}</strong>
                  <p className="mt-1 text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="step-arrow-v" aria-hidden="true">
                  ⬇
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`process-stepper ${className}`} aria-label={title}>
      <div className="process-title">
        <GitFork className="w-5 h-5" />
        <span>{title}</span>
      </div>
      <div className="stepper-grid">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className={`step-card ${step.active ? "active" : ""}`}>
              <div className="step-num">{step.number}</div>
              <strong className="text-sm font-bold">{step.title}</strong>
              <span className="leading-relaxed">{step.description}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="step-arrow" aria-hidden="true">
                <ArrowRight className="w-5 h-5 hidden lg:inline" />
                <span className="lg:hidden">➔</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
