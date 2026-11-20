-- ============================================================================
-- Fase 3 — Backfill de Metadados Estruturados e Infográficos nos Artigos Legados
-- Popula status, scheduled_at, tags, study_data, *_count e public.post_infographics
-- a partir dos comentários legados em content_html (idempotente).
-- Nota: não altera title nem content_html, logo não gera ruído em post_revisions.
-- ============================================================================

WITH extracted AS (
  SELECT
    p.id,
    p.is_published,
    CASE
      WHEN strpos(p.content_html, '<!-- STUDY_DATA_JSON_B64:') > 0 THEN
        trim(substr(
          p.content_html,
          strpos(p.content_html, '<!-- STUDY_DATA_JSON_B64:') + 25,
          strpos(substr(p.content_html, strpos(p.content_html, '<!-- STUDY_DATA_JSON_B64:') + 25), '-->') - 1
        ))
      ELSE NULL
    END AS raw_b64,
    CASE
      WHEN strpos(p.content_html, '<!-- TAGS:') > 0 THEN
        trim(substr(
          p.content_html,
          strpos(p.content_html, '<!-- TAGS:') + 10,
          strpos(substr(p.content_html, strpos(p.content_html, '<!-- TAGS:') + 10), '-->') - 1
        ))
      ELSE NULL
    END AS raw_tags,
    CASE
      WHEN strpos(p.content_html, '<!-- STATUS:') > 0 THEN
        lower(trim(substr(
          p.content_html,
          strpos(p.content_html, '<!-- STATUS:') + 12,
          strpos(substr(p.content_html, strpos(p.content_html, '<!-- STATUS:') + 12), '-->') - 1
        )))
      ELSE NULL
    END AS raw_status,
    CASE
      WHEN strpos(p.content_html, '<!-- SCHEDULED:') > 0 THEN
        trim(substr(
          p.content_html,
          strpos(p.content_html, '<!-- SCHEDULED:') + 15,
          strpos(substr(p.content_html, strpos(p.content_html, '<!-- SCHEDULED:') + 15), '-->') - 1
        ))
      ELSE NULL
    END AS raw_scheduled
  FROM public.posts p
),
decoded AS (
  SELECT
    e.id,
    CASE
      WHEN e.raw_status IN ('published', 'draft', 'review', 'scheduled') THEN e.raw_status
      WHEN e.is_published = false THEN 'draft'
      ELSE 'published'
    END AS parsed_status,
    CASE
      WHEN e.raw_scheduled IS NOT NULL AND e.raw_scheduled ~ '^\d{4}-\d{2}-\d{2}' THEN
        e.raw_scheduled::timestamptz
      ELSE NULL
    END AS parsed_scheduled_at,
    COALESCE(
      (
        SELECT array_agg(DISTINCT trim(tag_item))
        FROM unnest(string_to_array(COALESCE(e.raw_tags, ''), ',')) AS tag_item
        WHERE trim(tag_item) <> ''
      ),
      '{}'::text[]
    ) AS parsed_tags,
    COALESCE(
      (
        SELECT convert_from(
          decode(
            string_agg(
              CASE
                WHEN ord = 1 THEN encode(convert_to(part, 'UTF8'), 'hex')
                WHEN length(part) >= 2 AND left(part, 2) ~ '^[0-9A-Fa-f]{2}$'
                  THEN left(part, 2) || encode(convert_to(substr(part, 3), 'UTF8'), 'hex')
                ELSE '25' || encode(convert_to(part, 'UTF8'), 'hex')
              END,
              '' ORDER BY ord
            ),
            'hex'
          ),
          'UTF8'
        )::jsonb
        FROM unnest(string_to_array(e.raw_b64, '%')) WITH ORDINALITY AS t(part, ord)
        WHERE e.raw_b64 IS NOT NULL AND e.raw_b64 <> ''
      ),
      '{}'::jsonb
    ) AS parsed_study_data
  FROM extracted e
)
UPDATE public.posts p
SET
  status = d.parsed_status,
  scheduled_at = COALESCE(p.scheduled_at, d.parsed_scheduled_at),
  tags = CASE WHEN COALESCE(array_length(p.tags, 1), 0) = 0 THEN d.parsed_tags ELSE p.tags END,
  study_data = CASE WHEN p.study_data IS NULL OR p.study_data = '{}'::jsonb THEN d.parsed_study_data ELSE p.study_data END,
  flashcards_count = COALESCE(jsonb_array_length(
    CASE WHEN p.study_data IS NULL OR p.study_data = '{}'::jsonb THEN d.parsed_study_data->'flashcards' ELSE p.study_data->'flashcards' END
  ), 0),
  questions_count = COALESCE(jsonb_array_length(
    CASE WHEN p.study_data IS NULL OR p.study_data = '{}'::jsonb THEN d.parsed_study_data->'questions' ELSE p.study_data->'questions' END
  ), 0),
  simulados_count = COALESCE(jsonb_array_length(
    CASE WHEN p.study_data IS NULL OR p.study_data = '{}'::jsonb THEN d.parsed_study_data->'simulados' ELSE p.study_data->'simulados' END
  ), 0),
  infographics_count = COALESCE(jsonb_array_length(
    CASE WHEN p.study_data IS NULL OR p.study_data = '{}'::jsonb THEN d.parsed_study_data->'infographics' ELSE p.study_data->'infographics' END
  ), 0)
FROM decoded d
WHERE p.id = d.id;

-- Popula tabela dedicada public.post_infographics a partir de posts.study_data
INSERT INTO public.post_infographics (
  id,
  post_id,
  title,
  subtitle,
  summary,
  type,
  url,
  code_content,
  metadata,
  updated_at
)
SELECT
  CASE
    WHEN COALESCE(info->>'codeContent', '') <> '' THEN info->>'id'
    ELSE p.id::text || '_' || COALESCE(info->>'id', ordinality::text)
  END AS id,
  p.id AS post_id,
  COALESCE(NULLIF(info->>'title', ''), 'Infográfico') AS title,
  COALESCE(info->>'subtitle', '') AS subtitle,
  COALESCE(info->>'summary', '') AS summary,
  COALESCE(NULLIF(info->>'type', ''), 'resumo_visual') AS type,
  NULLIF(info->>'url', '') AS url,
  NULLIF(info->>'codeContent', '') AS code_content,
  jsonb_strip_nulls(jsonb_build_object(
    'points', COALESCE(info->'points', '[]'::jsonb),
    'imageUrl', info->'imageUrl',
    'hotspots', info->'hotspots',
    'splitSlider', info->'splitSlider'
  )) AS metadata,
  now() AS updated_at
FROM public.posts p,
LATERAL jsonb_array_elements(COALESCE(p.study_data->'infographics', '[]'::jsonb)) WITH ORDINALITY AS t(info, ordinality)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  summary = EXCLUDED.summary,
  type = EXCLUDED.type,
  url = EXCLUDED.url,
  code_content = EXCLUDED.code_content,
  metadata = EXCLUDED.metadata,
  updated_at = now();
