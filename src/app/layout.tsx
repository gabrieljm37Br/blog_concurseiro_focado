import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PWAProvider } from "@/components/pwa/PWAContext";
import { InstallAppModal } from "@/components/pwa/InstallAppModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Concurseiro Focado | Estudo Ativo & Ferramentas para Concursos",
  description: "Hub oficial de estudo ativo: artigos didáticos, técnicas de aprendizagem, flashcards interativos, simulados e APPs de gestão de estudo.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Concurseiro Focado",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans">
        <PWAProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <InstallAppModal />
        </PWAProvider>
      </body>
    </html>
  );
}
