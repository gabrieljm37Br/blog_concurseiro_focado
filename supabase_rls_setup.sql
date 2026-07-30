-- Script de Segurança & RLS (Row Level Security) para o Supabase
-- Copie e cole este script no SQL Editor do seu Painel do Supabase

-- 1. Habilitar RLS nas tabelas principais
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.flashcards ENABLE ROW LEVEL SECURITY;

-- 2. Política de Leitura Pública para Artigos (Qualquer visitante pode ler posts publicados)
DROP POLICY IF EXISTS "Artigos públicos visíveis para todos" ON public.posts;
CREATE POLICY "Artigos públicos visíveis para todos" 
ON public.posts 
FOR SELECT 
USING (is_published = true);

-- 3. Política de Escrita e Modificação Restrita ao Administrador Autenticado
DROP POLICY IF EXISTS "Apenas Administrador pode criar ou editar posts" ON public.posts;
CREATE POLICY "Apenas Administrador pode criar ou editar posts" 
ON public.posts 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Política de Leitura e Edição de Flashcards
DROP POLICY IF EXISTS "Flashcards visíveis para leitores" ON public.flashcards;
CREATE POLICY "Flashcards visíveis para leitores" 
ON public.flashcards 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Apenas Admin insere flashcards" ON public.flashcards;
CREATE POLICY "Apenas Admin insere flashcards" 
ON public.flashcards 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL);
