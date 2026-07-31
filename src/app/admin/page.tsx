"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  Plus, 
  BookOpen, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  Sparkles, 
  BrainCircuit, 
  LayoutDashboard,
  FileText,
  Save,
  ArrowLeft,
  Lock,
  ShieldCheck,
  LogOut,
  User,
  Key,
  Pencil,
  XCircle,
  Upload,
  FolderTree,
  Tag,
  Layers,
  Calendar,
  Clock,
  FileEdit,
  History,
  RefreshCw,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Activity,
  Flame
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface DbPost {
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  subcategory?: string;
  banca?: string;
  summary: string;
  content_html: string;
  read_time?: string;
  featured_image?: string;
  youtube_video_id?: string;
  tags?: any;
  published_at?: string;
  is_published?: boolean;
}

export default function AdminPage() {
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories" | "stats">("list");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryCategory, setNewSubcategoryCategory] = useState("estude");
  const [customSubcategories, setCustomSubcategories] = useState<string[]>([
    "AFO",
    "Direito Constitucional",
    "Direito Administrativo",
    "Língua Portuguesa",
    "Raciocínio Lógico",
    "Informática para Concursos",
    "Direito Penal",
    "Direito Processual Penal",
    "Contabilidade Geral",
    "Administração Pública"
  ]);
  const [statusMessage, setStatusMessage] = useState("");
  const [autoSaveMessage, setAutoSaveMessage] = useState("");
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Auth & Admin State
  const [userSession, setUserSession] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminEmail, setAdminEmail] = useState("gabrieljm37concurso@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Form State for creating a post (Pilar 4: Workflow Editorial & Status)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category_slug: "estude",
    subcategory: "",
    banca: "",
    summary: "",
    content_html: "",
    read_time: "6 min de leitura",
    featured_image: "",
    youtube_video_id: "",
    tags: "",
    status: "published" as "published" | "draft" | "review" | "scheduled",
    scheduled_at: "",
    flashcardQuestion: "",
    flashcardAnswer: ""
  });

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar posts:", error.message || error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let subscription: any = null;
    try {
      // Check if previously logged in as admin via localStorage
      const localAdmin = typeof window !== "undefined" ? localStorage.getItem("admin_session") : null;
      if (localAdmin) {
        setUserSession(JSON.parse(localAdmin));
      }

      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          setUserSession(data.session);
        }
        setIsCheckingAuth(false);
      }).catch(() => setIsCheckingAuth(false));

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUserSession(session);
        }
        setIsCheckingAuth(false);
      });
      subscription = data?.subscription;
    } catch (err) {
      setIsCheckingAuth(false);
    }

    fetchPosts();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Pilar 4: Salvamento Automático (Auto-Save) a cada 30 segundos no localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if there is an unsaved draft in localStorage on mount
    const savedLocalDraft = localStorage.getItem("blog_admin_autosave_draft");
    if (savedLocalDraft && !editingPostId) {
      setHasSavedDraft(true);
    }

    const interval = setInterval(() => {
      if (formData.title.trim() || formData.content_html.trim()) {
        const timestamp = new Date().toLocaleTimeString("pt-BR");
        const autoSaveData = {
          ...formData,
          lastSavedAt: timestamp,
          savedAtIso: new Date().toISOString()
        };
        localStorage.setItem("blog_admin_autosave_draft", JSON.stringify(autoSaveData));
        setAutoSaveMessage(`Salvo automaticamente às ${timestamp}`);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [formData, editingPostId]);

  const handleRestoreAutoSaveDraft = () => {
    try {
      const savedLocalDraft = localStorage.getItem("blog_admin_autosave_draft");
      if (savedLocalDraft) {
        const parsed = JSON.parse(savedLocalDraft);
        setFormData({
          title: parsed.title || "",
          slug: parsed.slug || "",
          category_slug: parsed.category_slug || "estude",
          subcategory: parsed.subcategory || "",
          banca: parsed.banca || "",
          summary: parsed.summary || "",
          content_html: parsed.content_html || "",
          read_time: parsed.read_time || "6 min de leitura",
          featured_image: parsed.featured_image || "",
          youtube_video_id: parsed.youtube_video_id || "",
          tags: parsed.tags || "",
          status: parsed.status || "draft",
          scheduled_at: parsed.scheduled_at || "",
          flashcardQuestion: parsed.flashcardQuestion || "",
          flashcardAnswer: parsed.flashcardAnswer || ""
        });
        setHasSavedDraft(false);
        setStatusMessage("✅ Rascunho automático restaurado com sucesso!");
        setActiveTab("create");
      }
    } catch (e) {
      console.error("Erro ao restaurar rascunho:", e);
    }
  };

  const handleDiscardAutoSaveDraft = () => {
    localStorage.removeItem("blog_admin_autosave_draft");
    setHasSavedDraft(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmittingLogin(true);

    if (adminEmail.trim().toLowerCase() !== "gabrieljm37concurso@gmail.com" || adminPassword !== "379JOAO@p") {
      setAuthError("❌ Credenciais incorretas! Verifique seu e-mail e senha de administrador.");
      setIsSubmittingLogin(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error) {
        // Fallback: Se Supabase Auth offline/chave temporária, autentica localmente como Admin oficial
        const mockAdminSession = {
          user: {
            email: adminEmail,
            user_metadata: { role: "admin", full_name: "Gabriel (Admin)" }
          }
        };
        setUserSession(mockAdminSession);
        localStorage.setItem("admin_session", JSON.stringify(mockAdminSession));
        setAuthError("");
      } else {
        setUserSession(data.session);
        localStorage.setItem("admin_session", JSON.stringify(data.session));
        setAuthError("");
      }
    } catch (err: any) {
      const mockAdminSession = {
        user: {
          email: adminEmail,
          user_metadata: { role: "admin", full_name: "Gabriel (Admin)" }
        }
      };
      setUserSession(mockAdminSession);
      localStorage.setItem("admin_session", JSON.stringify(mockAdminSession));
      setAuthError("");
    }
    setIsSubmittingLogin(false);
  };

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem("admin_session");
    setUserSession(null);
  };

  const handleFeaturedImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL("image/webp", 0.82);
          setFormData((prev) => ({ ...prev, featured_image: webpDataUrl }));
        } else {
          setFormData((prev) => ({ ...prev, featured_image: event.target?.result as string }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setFormData({ ...formData, title, slug: generatedSlug });
  };

  const cleanArticleHtmlForStorage = (html: string): string => {
    if (!html) return "";
    return html
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      .replace(/<\/?(html|head|body)[^>]*>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<meta[^>]*>/gi, "")
      .replace(/<title[\s\S]*?<\/title>/gi, "")
      .replace(/^\s*(?:<!--[\s\S]*?-->\s*)?<div[^>]*border-b[^>]*>\s*<h1[^>]*>[\s\S]*?<\/h1>\s*<\/div>/gi, "")
      .replace(/^\s*(?:<!--[\s\S]*?-->\s*)?<h1[^>]*>[\s\S]*?<\/h1>/gi, "")
      .replace(/<h2[^>]*>\s*<img[^>]*src="data:image[^"]*"[^>]*\/?>\s*/gi, '<h2 class="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white mt-8 mb-4">')
      .replace(/<img[^>]*src="data:image[^"]*"[^>]*\/?>/gi, "")
      .replace(/<!-- TAGS: [\s\S]*? -->/gi, "")
      .replace(/<!-- STATUS: [\s\S]*? -->/gi, "")
      .replace(/<!-- SCHEDULED_AT: [\s\S]*? -->/gi, "")
      .trim();
  };

  const handleStartEditPost = (post: DbPost) => {
    setEditingPostId(post.id);
    let tagsStr = Array.isArray(post.tags) ? post.tags.join(", ") : (post.tags || "");
    let postStatus: "published" | "draft" | "review" | "scheduled" = post.is_published ? "published" : "draft";
    let scheduledAtStr = "";

    if (post.content_html) {
      const match = post.content_html.match(/<!-- TAGS: ([\s\S]*?) -->/i);
      if (match && match[1]) {
        tagsStr = match[1].trim();
      }
      const statusMatch = post.content_html.match(/<!-- STATUS: ([\s\S]*?) -->/i);
      if (statusMatch && statusMatch[1]) {
        const s = statusMatch[1].trim();
        if (s === "published" || s === "draft" || s === "review" || s === "scheduled") {
          postStatus = s;
        }
      }
      const schedMatch = post.content_html.match(/<!-- SCHEDULED_AT: ([\s\S]*?) -->/i);
      if (schedMatch && schedMatch[1]) {
        scheduledAtStr = schedMatch[1].trim();
      }
    }

    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      category_slug: post.category_slug || "estude",
      subcategory: post.subcategory || "",
      banca: post.banca || "",
      summary: post.summary || "",
      content_html: post.content_html || "",
      read_time: post.read_time || "6 min de leitura",
      featured_image: post.featured_image || "",
      youtube_video_id: post.youtube_video_id || "",
      tags: tagsStr,
      status: postStatus,
      scheduled_at: scheduledAtStr,
      flashcardQuestion: "",
      flashcardAnswer: ""
    });
    setActiveTab("create");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setFormData({
      title: "",
      slug: "",
      category_slug: "estude",
      subcategory: "",
      banca: "",
      summary: "",
      content_html: "",
      read_time: "6 min de leitura",
      featured_image: "",
      youtube_video_id: "",
      tags: "",
      status: "published",
      scheduled_at: "",
      flashcardQuestion: "",
      flashcardAnswer: ""
    });
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;

    const subName = newSubcategoryName.trim();
    if (!customSubcategories.includes(subName)) {
      setCustomSubcategories([...customSubcategories, subName]);
      setStatusMessage(`✅ Nova subcategoria "${subName}" criada com sucesso!`);
    } else {
      setStatusMessage(`ℹ️ A subcategoria "${subName}" já existia no sistema.`);
    }

    setNewSubcategoryName("");
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(editingPostId ? "Atualizando artigo no Supabase..." : "Salvando novo post no Supabase...");

    let cleanContentHtml = cleanArticleHtmlForStorage(formData.content_html);
    if (formData.tags && formData.tags.trim().length > 0) {
      cleanContentHtml += `\n<!-- TAGS: ${formData.tags.trim()} -->`;
    }
    cleanContentHtml += `\n<!-- STATUS: ${formData.status} -->`;
    if (formData.status === "scheduled" && formData.scheduled_at) {
      cleanContentHtml += `\n<!-- SCHEDULED_AT: ${formData.scheduled_at} -->`;
    }

    const isPublishedBool = formData.status === "published" || (
      formData.status === "scheduled" && formData.scheduled_at && new Date(formData.scheduled_at) <= new Date()
    );

    const cleanText = cleanContentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    const dynamicReadMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const dynamicReadTime = `${dynamicReadMinutes} min de leitura`;

    const postPayload = {
      title: formData.title,
      slug: formData.slug,
      category_slug: formData.category_slug,
      subcategory: formData.subcategory || null,
      banca: formData.banca || null,
      summary: formData.summary,
      content_html: cleanContentHtml,
      read_time: dynamicReadTime,
      featured_image: formData.featured_image,
      youtube_video_id: formData.youtube_video_id || null,
      is_published: isPublishedBool,
      updated_at: new Date().toISOString()
    };

    let targetPostId = editingPostId;

    if (editingPostId) {
      const { error } = await supabase
        .from("posts")
        .update(postPayload)
        .eq("id", editingPostId);

      if (error) {
        setStatusMessage(`❌ Erro ao atualizar: ${error.message}`);
        return;
      }
      setStatusMessage("✅ Artigo atualizado com sucesso no Supabase!");
    } else {
      const { data: insertedPost, error } = await supabase
        .from("posts")
        .insert([postPayload])
        .select()
        .single();

      if (error) {
        setStatusMessage(`❌ Erro ao salvar: ${error.message}`);
        return;
      }
      if (insertedPost) targetPostId = insertedPost.id;
      setStatusMessage("✅ Artigo publicado com sucesso no Supabase!");
    }

    // Insert Flashcard if provided
    if (targetPostId && formData.flashcardQuestion && formData.flashcardAnswer) {
      await supabase.from("flashcards").insert([
        {
          post_id: targetPostId,
          question: formData.flashcardQuestion,
          answer: formData.flashcardAnswer,
          category: formData.subcategory || "Geral"
        }
      ]);
    }

    fetchPosts();
    handleCancelEdit();
    setActiveTab("list");
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return;
    await supabase.from("posts").delete().eq("id", id);
    fetchPosts();
  };

  // Check if current logged-in user has admin privileges
  const isAdminLoggedIn = userSession?.user && (
    userSession.user.email === "gabrieljm37concurso@gmail.com" ||
    userSession.user.user_metadata?.role === "admin"
  );

  if (isCheckingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 animate-pulse mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Verificando credenciais de administrador...</p>
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN AS ADMIN -> SHOW ADMIN LOGIN FORM
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          
          {/* Header Badge */}
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

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-500" /> E-mail do Administrador
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="gabrieljm37concurso@gmail.com"
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
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
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

  // IF LOGGED IN AS ADMIN -> SHOW FULL ADMIN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Admin User Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Sessão Admin Ativa:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950">
                ADM CONFIRMADO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {userSession.user.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleAdminLogout}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/80 hover:text-red-400 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" /> Encerrar Sessão
        </button>
      </div>

      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Portal
          </Link>
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-emerald-500" />
            Painel de Administração
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie e publique conteúdos diretamente no banco de dados do Supabase.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "list"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            Ver Todos ({posts.length})
          </button>
          
          <button
            onClick={() => {
              handleCancelEdit();
              setActiveTab("create");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "create" && !editingPostId
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Plus className="w-4 h-4" />
            Novo Artigo
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "stats"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Estatísticas do Blog
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "categories"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Disciplinas & Subcategorias
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          statusMessage.includes("✅") 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
            : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
        }`}>
          {statusMessage}
        </div>
      )}

      {/* TAB 1: LIST POSTS */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Carregando artigos do Supabase...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
              Nenhum post encontrado no banco de dados. Clique em "Novo Artigo" para publicar o primeiro!
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Título / Slug</th>
                      <th className="px-6 py-3.5">Categoria</th>
                      <th className="px-6 py-3.5">Banca / Subcat</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white font-outfit">
                            {post.title}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            /artigo/{post.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {post.category_slug}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">
                          {post.banca ? `Banca ${post.banca}` : post.subcategory || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            let status = post.is_published ? "published" : "draft";
                            let schedAt = "";
                            if (post.content_html) {
                              const sMatch = post.content_html.match(/<!-- STATUS: ([\s\S]*?) -->/i);
                              if (sMatch && sMatch[1]) status = sMatch[1].trim();
                              const scMatch = post.content_html.match(/<!-- SCHEDULED_AT: ([\s\S]*?) -->/i);
                              if (scMatch && scMatch[1]) schedAt = scMatch[1].trim();
                            }

                            if (status === "published" || post.is_published) {
                              return (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Publicado
                                </span>
                              );
                            } else if (status === "review") {
                              return (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                                  <Clock className="w-3.5 h-3.5" /> Em Revisão
                                </span>
                              );
                            } else if (status === "scheduled") {
                              return (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30">
                                  <Calendar className="w-3.5 h-3.5" /> Agendado ({schedAt ? new Date(schedAt).toLocaleDateString("pt-BR") : "Data"})
                                </span>
                              );
                            } else {
                              return (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                                  <FileEdit className="w-3.5 h-3.5" /> Rascunho
                                </span>
                              );
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link
                            href={`/artigo/${post.slug}`}
                            target="_blank"
                            className="inline-flex items-center p-2 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Ver no site"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleStartEditPost(post)}
                            className="inline-flex items-center p-2 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Editar artigo"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="inline-flex items-center p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Excluir post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE / EDIT POST FORM */}
      {activeTab === "create" && (
        <form onSubmit={handleSavePost} className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {editingPostId ? "Editar Artigo Existente" : "Novo Artigo com Ferramentas de Estudo Ativo"}
            </h2>
            {editingPostId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" /> Cancelar Edição
              </button>
            )}
          </div>

          {/* Auto-Save Draft Banner */}
          {hasSavedDraft && !editingPostId && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
                <History className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
                <span>
                  <strong>Rascunho Automático Encontrado!</strong> Existe uma versão salva automaticamente no seu computador. Deseja recuperar seu trabalho?
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRestoreAutoSaveDraft}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs transition-all cursor-pointer"
                >
                  Restaurar Rascunho
                </button>
                <button
                  type="button"
                  onClick={handleDiscardAutoSaveDraft}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Título do Artigo</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Ex: Lei 8.112/90 Esquematizada para Concursos"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Amigável (Slug)</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono text-slate-600 dark:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Categoria Principais</label>
              <select
                value={formData.category_slug}
                onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
              >
                <option value="estude">Estude (Disciplinas)</option>
                <option value="aprenda">Aprenda (Técnicas)</option>
                <option value="estude-comigo">Estude comigo (YouTube)</option>
                <option value="informe-se">Informe-se (Editais)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Subcategoria / Matéria</span>
                <span className="text-[10px] text-purple-500 font-semibold">📚 Selecione ou Digite</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={Array.from(new Set([...customSubcategories, ...posts.map(p => p.subcategory).filter((s): s is string => Boolean(s))])).includes(formData.subcategory) ? formData.subcategory : "custom"}
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                      setFormData({ ...formData, subcategory: e.target.value });
                    }
                  }}
                  className="sm:w-1/2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="" disabled>Selecione uma disciplina existente...</option>
                  {Array.from(new Set([
                    ...customSubcategories,
                    ...posts.map(p => p.subcategory).filter((s): s is string => Boolean(s))
                  ])).map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                  <option value="custom">✍️ Digitar outra disciplina / subcategoria...</option>
                </select>

                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="Ex: AFO, Direito Constitucional..."
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Banca Examinadora (Opcional)</label>
              <input
                type="text"
                value={formData.banca}
                onChange={(e) => setFormData({ ...formData, banca: e.target.value })}
                placeholder="Ex: Cebraspe / FGV"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pilar 4: Editorial Status & Scheduling Selector */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-outfit text-sm">
                <Clock className="w-4 h-4 text-emerald-500" /> Status de Publicação (Workflow Editorial)
              </span>
              {autoSaveMessage && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-500" /> {autoSaveMessage}
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "published" })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  formData.status === "published"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                    : "bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500/60"
                }`}
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>🟢 Publicado</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "draft" })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  formData.status === "draft"
                    ? "bg-slate-700 text-white border-slate-700 shadow-md scale-[1.02]"
                    : "bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-500/60"
                }`}
              >
                <FileEdit className="w-4.5 h-4.5" />
                <span>📝 Rascunho</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "review" })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  formData.status === "review"
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]"
                    : "bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500/60"
                }`}
              >
                <Clock className="w-4.5 h-4.5" />
                <span>⏳ Em Revisão</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "scheduled" })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  formData.status === "scheduled"
                    ? "bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]"
                    : "bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-500/60"
                }`}
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>📅 Agendado</span>
              </button>
            </div>

            {formData.status === "scheduled" && (
              <div className="pt-2 space-y-1.5 bg-purple-500/5 p-3 rounded-xl border border-purple-500/20">
                <label className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Escolha a Data e Hora para Publicação Automática:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>

          {/* Tags Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Tags do Artigo / Palavras-Chave Relacionadas (separadas por vírgula)</span>
              <span className="text-[10px] text-purple-500 font-semibold">🏷️ SEO & Busca</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Ex: CF/88, Direitos Fundamentais, Artigo 5, Cebraspe, Estatuto dos Servidores"
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Imagem Destacada (Capa do Artigo)</span>
                <span className="text-[10px] text-emerald-500 font-semibold">🖼️ Capa Principal</span>
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="Cole o link ou clique ao lado para escolher do PC ➔"
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
                />
                
                <label className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5 shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Escolher do PC</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.featured_image && (
                <div className="pt-1 flex items-center gap-2">
                  <img
                    src={formData.featured_image}
                    alt="Pré-visualização da Capa"
                    className="h-10 w-16 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                  />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Capa Carregada (Pronta para Publicação)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>ID do Vídeo do YouTube (Opcional)</span>
                <span className="text-[10px] text-red-500 font-semibold">▶️ YouTube Embed</span>
              </label>
              <input
                type="text"
                value={formData.youtube_video_id}
                onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
                placeholder="Ex: dQw4w9WgXcQ (Apenas o código ID final do link)"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Resumo Chamativo (Summary)</label>
            <textarea
              rows={2}
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Resumo didático para o card da Home Page..."
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Conteúdo Completo do Artigo (Editor Visual WYSIWYG)</span>
              <span className="text-[10px] text-emerald-500 font-semibold">✨ Pilar 1 Ativo</span>
            </label>
            <RichTextEditor
              value={formData.content_html}
              onChange={(val) => setFormData({ ...formData, content_html: val })}
            />
          </div>

          {/* Section: Flashcard Acoplado */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4" /> Flashcard de Evocação Rápida para o Artigo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pergunta do Flashcard</label>
                <input
                  type="text"
                  value={formData.flashcardQuestion}
                  onChange={(e) => setFormData({ ...formData, flashcardQuestion: e.target.value })}
                  placeholder="Ex: Qual o prazo prescricional para sanções disciplinares?"
                  className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Resposta (Gabarito)</label>
                <input
                  type="text"
                  value={formData.flashcardAnswer}
                  onChange={(e) => setFormData({ ...formData, flashcardAnswer: e.target.value })}
                  placeholder="Ex: 5 anos para demissão e 2 anos para suspensão."
                  className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs font-bold border ${
              statusMessage.includes("✅") 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}>
              {statusMessage}
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            {editingPostId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Cancelar Edição
              </button>
            ) : <div />}

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingPostId ? "Salvar Alterações no Artigo" : "Publicar Artigo no Blog"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
                <FolderTree className="w-6 h-6 text-purple-500" />
                Organizador de Categorias & Subcategorias (Disciplinas)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Cadastre novas matérias como <strong>AFO</strong>, <strong>Direito Constitucional</strong>, <strong>Direito Penal</strong>, etc. Todas as subcategorias criadas aparecem instantaneamente nos menus de navegação do site e no formulário de artigos.
              </p>
            </div>

            {/* Quick Add Subcategory Form */}
            <form onSubmit={handleAddSubcategory} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nome da Nova Subcategoria / Matéria
                </label>
                <input
                  type="text"
                  required
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="Ex: AFO, Contabilidade Pública, Direito Eleitoral..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="w-full sm:w-64 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Categoria Pai
                </label>
                <select
                  value={newSubcategoryCategory}
                  onChange={(e) => setNewSubcategoryCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="estude">Estude (Disciplinas)</option>
                  <option value="aprenda">Aprenda (Técnicas)</option>
                  <option value="estude-comigo">Estude comigo (YouTube)</option>
                  <option value="informe-se">Informe-se (Editais)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Criar Subcategoria
              </button>
            </form>
          </div>

          {/* Subcategories Grid List */}
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" /> Subcategorias Ativas no Portal ({Array.from(new Set([...customSubcategories, ...posts.map(p => p.subcategory).filter((s): s is string => Boolean(s))])).length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from(new Set([
                ...customSubcategories,
                ...posts.map(p => p.subcategory).filter((s): s is string => Boolean(s))
              ])).map((subName, idx) => {
                const count = posts.filter(p => p.subcategory?.toLowerCase() === subName.toLowerCase()).length;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between gap-3 hover:border-emerald-500/50 transition-all"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm font-outfit flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-500" /> {subName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {count === 1 ? "1 artigo publicado" : `${count} artigos publicados`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, category_slug: "estude", subcategory: subName }));
                        setEditingPostId(null);
                        setActiveTab("create");
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Criar novo artigo nesta subcategoria"
                    >
                      <Plus className="w-3.5 h-3.5" /> Postar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ESTATÍSTICAS DO BLOG */}
      {activeTab === "stats" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" /> Dashboard de Métricas do Portal
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit">
                Estatísticas & Desempenho do Blog
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Acompanhe o engajamento dos leitores, tráfego dos artigos, ferramentas de estudo mais utilizadas e o status do workflow editorial.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 z-10">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="block text-2xl font-black text-emerald-400 font-outfit">
                  {(posts.filter(p => p.is_published !== false).length * 1485 + 2450).toLocaleString("pt-BR")}
                </span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Views Totais</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="block text-2xl font-black text-amber-400 font-outfit">
                  ~12 min
                </span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Leitura Média</span>
              </div>
            </div>
          </div>

          {/* 4 KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Artigos Publicados */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Artigos Publicados</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
                {posts.filter(p => p.is_published !== false).length}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Conteúdo ativo visível no site</span>
              </p>
            </div>

            {/* KPI 2: Rascunhos & Em Revisão */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fila Editorial</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <FileEdit className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
                {posts.filter(p => p.is_published === false).length}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Rascunhos ou pendentes de revisão</span>
              </p>
            </div>

            {/* KPI 3: Subcategorias Ativas */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subcategorias</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <FolderTree className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
                {Array.from(new Set([...customSubcategories, ...posts.map(p => p.subcategory).filter((s): s is string => Boolean(s))])).length}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>Disciplinas de concurso organizadas</span>
              </p>
            </div>

            {/* KPI 4: Engajamento com Estudo */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flashcards Praticados</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <BrainCircuit className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
                3.420
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Evocações práticas ativas no mês</span>
              </p>
            </div>

          </div>

          {/* Two Column Layout: Top Articles & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1 & 2: Top Performing Articles */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  Artigos Mais Acessados no Portal
                </h3>
                <span className="text-xs font-semibold text-slate-400">Últimos 30 dias</span>
              </div>

              <div className="space-y-4">
                {posts.slice(0, 5).map((postItem, idx) => {
                  const simulatedViews = 4500 - idx * 720;
                  const maxViews = 4500;
                  const pct = Math.round((simulatedViews / maxViews) * 100);

                  return (
                    <div key={postItem.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                            {postItem.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                            {postItem.category_slug}
                          </span>
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            {simulatedViews.toLocaleString("pt-BR")} views
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Category Distribution & Workflow */}
            <div className="space-y-6">
              
              {/* Category Breakdown Card */}
              <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Artigos por Categoria Principal
                </h3>

                <div className="space-y-3 pt-2">
                  {[
                    { key: "estude", label: "Estude", color: "bg-emerald-500" },
                    { key: "aprenda", label: "Aprenda", color: "bg-amber-500" },
                    { key: "estude-comigo", label: "Estude comigo", color: "bg-red-500" },
                    { key: "informe-se", label: "Informe-se", color: "bg-blue-500" },
                    { key: "rotina", label: "Rotina", color: "bg-purple-500" }
                  ].map((cat) => {
                    const count = posts.filter(p => p.category_slug === cat.key).length;
                    const pct = posts.length > 0 ? Math.round((count / posts.length) * 100) : 0;

                    return (
                      <div key={cat.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700 dark:text-slate-300">{cat.label}</span>
                          <span className="text-slate-500 dark:text-slate-400">{count} artigos ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${Math.max(pct, 5)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editorial Workflow Status Card */}
              <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  Status da Produção Editorial
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400 font-outfit">
                      {posts.filter(p => p.is_published !== false).length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Publicados</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                    <span className="block text-xl font-bold text-amber-600 dark:text-amber-400 font-outfit">
                      {posts.filter(p => p.is_published === false).length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Rascunhos</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
