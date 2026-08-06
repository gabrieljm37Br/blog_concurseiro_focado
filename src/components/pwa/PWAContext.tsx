"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isInstalledSuccess: boolean;
  isModalOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  triggerNativeInstall: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isStandalone: false,
  isIOS: false,
  isAndroid: false,
  isDesktop: false,
  isInstalledSuccess: false,
  isModalOpen: false,
  openInstallModal: () => {},
  closeInstallModal: () => {},
  triggerNativeInstall: async () => false,
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 1. Check user agent & standalone status
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
      const android = /Android/.test(ua);
      const desktop = !ios && !android;

      setIsIOS(ios);
      setIsAndroid(android);
      setIsDesktop(desktop);

      // Check if running in standalone mode (already installed as PWA)
      const isStandaloneMatch =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");

      setIsStandalone(isStandaloneMatch);

      // Listen for standalone display mode changes
      const mediaQuery = window.matchMedia("(display-mode: standalone)");
      const handleMediaChange = (e: MediaQueryListEvent) => {
        setIsStandalone(e.matches);
      };
      mediaQuery.addEventListener("change", handleMediaChange);

      // 2. Register Service Worker ONLY in production on remote domains
      const isLocalhost = 
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1" || 
        window.location.hostname.endsWith(".local");

      if ("serviceWorker" in navigator) {
        if (process.env.NODE_ENV === "production" && !isLocalhost) {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
              console.log("PWA Service Worker registrado com sucesso:", reg.scope);
            })
            .catch((err) => {
              console.error("Falha ao registrar Service Worker:", err);
            });
        } else {
          // Unregister any active service worker on localhost to prevent Next.js HMR WebSocket loop
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister().then((unregistered) => {
                if (unregistered) {
                  console.log("Service Worker antigo desregistrado do localhost para evitar conflito com HMR.");
                }
              });
            }
          });
        }
      }

      // 3. Listen for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      };

      // 4. Listen for appinstalled event
      const handleAppInstalled = () => {
        setIsInstalledSuccess(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        setIsStandalone(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        mediaQuery.removeEventListener("change", handleMediaChange);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const triggerNativeInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalledSuccess(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.error("Erro no prompt de instalação nativo:", err);
    }
    return false;
  };

  const openInstallModal = () => setIsModalOpen(true);
  const closeInstallModal = () => setIsModalOpen(false);

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isStandalone,
        isIOS,
        isAndroid,
        isDesktop,
        isInstalledSuccess,
        isModalOpen,
        openInstallModal,
        closeInstallModal,
        triggerNativeInstall,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}
