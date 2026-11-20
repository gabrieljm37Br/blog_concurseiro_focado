-- ============================================================================
-- Fase 1 — Estabilização e Segurança (RLS + Auth App Metadata + Advisor Fixes)
-- Execute este script no SQL Editor do Supabase (projeto ovpyjsjvowhhyxvwbedh)
-- ============================================================================

-- 1. Promove a role 'admin' no app_metadata (somente controlado pelo servidor/JWT,
--    imutável pelo cliente via supabase.auth.updateUser)
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE lower(email) = 'gabrieljm37concurso@gmail.com';

-- 2. Função segura de verificação de administrador via JWT app_metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- 3. Endurecimento de RLS em public.posts
--    Remove políticas antigas que permitiam escrita/exclusão pública (ALL / true)
DROP POLICY IF EXISTS "Leitura publica de posts" ON public.posts;
DROP POLICY IF EXISTS "Gerenciamento completo de posts" ON public.posts;
DROP POLICY IF EXISTS "posts_select_public_or_admin" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_admin_only" ON public.posts;
DROP POLICY IF EXISTS "posts_update_admin_only" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_admin_only" ON public.posts;

CREATE POLICY "posts_select_public_or_admin"
  ON public.posts
  FOR SELECT
  TO public
  USING (is_published = true OR public.is_admin());

CREATE POLICY "posts_insert_admin_only"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "posts_update_admin_only"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "posts_delete_admin_only"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. Endurecimento de RLS em public.subcategories
DROP POLICY IF EXISTS "Leitura pública de subcategorias" ON public.subcategories;
DROP POLICY IF EXISTS "Gerenciamento completo de subcategorias" ON public.subcategories;
DROP POLICY IF EXISTS "subcategories_select_public" ON public.subcategories;
DROP POLICY IF EXISTS "subcategories_insert_admin_only" ON public.subcategories;
DROP POLICY IF EXISTS "subcategories_update_admin_only" ON public.subcategories;
DROP POLICY IF EXISTS "subcategories_delete_admin_only" ON public.subcategories;

CREATE POLICY "subcategories_select_public"
  ON public.subcategories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "subcategories_insert_admin_only"
  ON public.subcategories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "subcategories_update_admin_only"
  ON public.subcategories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "subcategories_delete_admin_only"
  ON public.subcategories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. Correção dos alertas de segurança do Supabase Security Advisor
ALTER FUNCTION public.update_updated_at() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
