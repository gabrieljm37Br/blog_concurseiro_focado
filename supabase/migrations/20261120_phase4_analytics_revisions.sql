-- ============================================================================
-- Fase 4 — Diferenciação, Analytics Real e Versionamento Editorial
-- 100% não-destrutivo e compatível com RLS estrito
-- ============================================================================

-- 1. Contador real de visualizações em public.posts + RPC segura para incremento anônimo
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_post_view(target_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.posts
  SET views_count = coalesce(views_count, 0) + 1
  WHERE slug = target_slug
    AND is_published = true;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_post_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_post_view(text) TO anon, authenticated;

-- 2. Tabela de versionamento histórico de artigos (fundamental para atualizações jurídicas)
CREATE TABLE IF NOT EXISTS public.post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  content_html text,
  revision_note text DEFAULT 'Atualização editorial',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_revisions_post_id_created_idx
  ON public.post_revisions (post_id, created_at DESC);

ALTER TABLE public.post_revisions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_revisions' AND policyname = 'post_revisions_admin_only'
  ) THEN
    CREATE POLICY "post_revisions_admin_only"
      ON public.post_revisions
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Trigger automático: grava snapshot anterior sempre que o conteúdo de um post é alterado
CREATE OR REPLACE FUNCTION public.capture_post_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (OLD.content_html IS DISTINCT FROM NEW.content_html) OR (OLD.title IS DISTINCT FROM NEW.title) THEN
    INSERT INTO public.post_revisions (post_id, title, summary, content_html, revision_note)
    VALUES (OLD.id, OLD.title, OLD.summary, OLD.content_html, 'Snapshot automático pré-edição');
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.capture_post_revision() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_capture_post_revision'
  ) THEN
    CREATE TRIGGER trg_capture_post_revision
      BEFORE UPDATE ON public.posts
      FOR EACH ROW
      EXECUTE FUNCTION public.capture_post_revision();
  END IF;
END $$;
