-- ============================================================================
-- Fase 3 — Escalabilidade e Infraestrutura
-- Desacoplamento de Metadados + Tabela de Infográficos + Supabase Storage CDN
-- Execute este script no SQL Editor do Supabase (projeto ovpyjsjvowhhyxvwbedh)
-- ============================================================================

-- 1. Colunas estruturadas em public.posts (retrocompatível, não destrutivo)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS study_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS flashcards_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS questions_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS simulados_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS infographics_count integer NOT NULL DEFAULT 0;

-- Garante integridade de valores permitidos para status editorial
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_status_valid_chk'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_status_valid_chk
      CHECK (status IN ('published', 'draft', 'review', 'scheduled'));
  END IF;
END $$;

-- Índices para listagem rápida na Home, filtros e busca por tags
CREATE INDEX IF NOT EXISTS posts_published_created_idx
  ON public.posts (is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS posts_category_slug_idx
  ON public.posts (category_slug);

CREATE INDEX IF NOT EXISTS posts_tags_gin_idx
  ON public.posts USING GIN (tags);

-- 2. Tabela dedicada para infográficos (elimina full table scan em /api/infograficos/[id])
CREATE TABLE IF NOT EXISTS public.post_infographics (
  id text PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text DEFAULT '',
  summary text DEFAULT '',
  type text DEFAULT 'resumo_visual',
  url text,
  code_content text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_infographics_post_id_idx
  ON public.post_infographics (post_id);

ALTER TABLE public.post_infographics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_infographics' AND policyname = 'post_infographics_select_public_or_admin'
  ) THEN
    CREATE POLICY "post_infographics_select_public_or_admin"
      ON public.post_infographics
      FOR SELECT
      TO public
      USING (
        public.is_admin() OR EXISTS (
          SELECT 1 FROM public.posts p
          WHERE p.id = post_infographics.post_id
            AND p.is_published = true
            AND (p.status = 'published' OR (p.status = 'scheduled' AND p.scheduled_at <= now()))
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_infographics' AND policyname = 'post_infographics_write_admin_only'
  ) THEN
    CREATE POLICY "post_infographics_write_admin_only"
      ON public.post_infographics
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 3. Bucket público do Supabase Storage para imagens WebP (substitui Base64 no banco)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-media',
  'article-media',
  true,
  5242880,
  ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'article_media_public_read'
  ) THEN
    CREATE POLICY "article_media_public_read"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'article-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'article_media_admin_insert'
  ) THEN
    CREATE POLICY "article_media_admin_insert"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'article-media' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'article_media_admin_update'
  ) THEN
    CREATE POLICY "article_media_admin_update"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'article-media' AND public.is_admin())
      WITH CHECK (bucket_id = 'article-media' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'article_media_admin_delete'
  ) THEN
    CREATE POLICY "article_media_admin_delete"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'article-media' AND public.is_admin());
  END IF;
END $$;
