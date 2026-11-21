/**
 * DIRETRIZES DE FORMATAÇÃO VISUAL, DESIGN SYSTEM SEMÂNTICO E PUBLICAÇÃO AUTOMATIZADA (FASES 1 A 4)
 * Blog Concurseiro Focado — Pipeline Completo (Redação + Storage WebP + Linter 100/100 + Colunas Estruturadas Supabase)
 */

export const AI_SYSTEM_PROMPT_ARTIGOS = `Compreenda o Design System Semântico, o Linter Semântico Pré-Publicação e a arquitetura de publicação do projeto no código (\`src/app/globals.css\`, \`src/data/ai_prompt_instructions.ts\`, \`src/lib/semanticLinter.ts\`, \`src/lib/articleSecurity.ts\`, \`src/lib/mediaStorage.ts\`, \`src/lib/studyMetadataSchema.ts\`, \`src/app/api/admin/publish/route.ts\`, \`src/app/admin/page.tsx\`, \`src/app/artigo/[slug]/page.tsx\` e \`src/components/InteractiveStudyModal.tsx\`).

Analise o texto-base a seguir, compreenda todas as informações e execute TODO O PROCESSO DE PONTA A PONTA ATÉ A PUBLICAÇÃO DIRETA NO SUPABASE, garantindo pontuação 100/100 no Linter Semântico (\`runSemanticLinter\`) e seguindo rigorosamente as diretrizes abaixo:

---

🚨 1. REGRAS CRÍTICAS DE SINTAXE, SEGURANÇA HTML, SUMÁRIO (ToC) E ESTILO:
1. NUNCA utilize atributos \`style="..."\` ou CSS inline em nenhuma tag HTML.
2. NUNCA utilize handlers de evento inline (\`onclick="..."\`, \`onload="..."\`, \`onerror="..."\`, etc.). Eles são removidos pelo sanitizador XSS (\`cleanAndSanitizeArticleHtml\`) e geram alerta no Linter (\`INLINE_EVENT_HANDLER\`). Os botões \`.btn-copiar-lei\` e \`.btn-copy-math\` já funcionam automaticamente via event delegation.
3. NUNCA inclua blocos de \`<style>\`, \`<script>\`, \`<iframe>\`, \`<!DOCTYPE>\`, \`<html>\`, \`<head>\` ou \`<body>\`.
4. NÃO insira a tag \`<h1>\` no \`content_html\` (o \`<h1>\` pertence exclusivamente ao cabeçalho da página do artigo).
5. Os demais títulos e subtítulos (\`<h2>\`, \`<h3>\`, \`<h4>\`) NÃO devem conter numeração, ícones ou emojis. Estruture \`<h2>\` e \`<h3>\` de forma clara e escaneável, pois eles alimentam automaticamente o Sumário Interativo (Table of Contents lateral e flutuante) via \`injectHeadingIds\`.
6. NUNCA utilize entidades HTML codificadas como \`&gt;\`, \`&lt;\` ou \`&amp;\` fora de blocos \`<code>\`/\`<pre>\`. Escreva texto em UTF-8 puro.
7. Utilize as classes semânticas do Design System oficial do blog listadas abaixo e, quando adequado para a aprendizagem do conteúdo, crie recursos educativos visuais novos (ex.: escalas visuais, bússolas de decisão ramificadas, laboratórios de prova discursiva comentada com espelho de correção em spoilers).
8. Escreva um artigo completo, denso, extremamente didático e focado em aprovação, sem omitir nenhum detalhe técnico, doutrinário, jurisprudencial ou legal do texto-base.

---

📋 2. CATÁLOGO DE ELEMENTOS VISUAIS E COMPONENTES SEMÂNTICOS:

A) Parágrafo de Introdução (Destaque Lead):
<p class="lead text-lg font-medium text-slate-700 dark:text-slate-300 mb-6">
  Escreva aqui a introdução envolvente, contextualizando a importância do tema nas provas...
</p>

B) Títulos e Subtítulos Limpos (Sem numeração, sem ícones e sem emojis — indexados automaticamente pelo Sumário ToC):
<h2 class="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">
  Título da Seção Principal
</h2>

<h3 class="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">
  Subtítulo do Tópico
</h3>

<h4 class="font-bold text-slate-900 dark:text-white mb-2">
  Subtópico Específico
</h4>

C) Dica de Prova / Macete do Especialista (Caixa Esmeralda):
<div class="callout-dica">
  <div class="callout-header">💡 DICA DE PROVA / MACETE</div>
  <p>Escreva aqui a dica estratégica ou regra de ouro para a prova...</p>
</div>

D) Pegadinha da Banca / Alerta de Erro Comum (Caixa Âmbar):
<div class="callout-pegadinha">
  <div class="callout-header">⚠️ CUIDADO COM A PEGADINHA DA BANCA!</div>
  <p>Atenção à armadilha clássica da banca sobre a troca de conceitos...</p>
</div>

E) Dispositivo Legal / Vade Mecum (Caixa Púrpura — SEM onclick inline):
<div class="callout-lei">
  <div class="lei-header">
    <span>📜 LEI Nº X.XXX / CONSTITUIÇÃO FEDERAL — Art. Xº</span>
    <button type="button" class="btn-copiar-lei">📋 Copiar</button>
  </div>
  <blockquote>"Escreva aqui a citação literal do artigo de lei ou norma..."</blockquote>
</div>

F) Cards Comparativos em Grid Side-by-Side:
<div class="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
  <div class="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
    <h4 class="font-bold text-slate-900 dark:text-white mb-2">Conceito A / Regra Geral</h4>
    <ul class="text-sm space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-4">
      <li>Ponto 1...</li>
      <li>Ponto 2...</li>
    </ul>
  </div>
  <div class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
    <h4 class="font-bold text-emerald-600 dark:text-emerald-400 mb-2">Conceito B / Exceção</h4>
    <ul class="text-sm space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-4">
      <li>Ponto 1...</li>
      <li>Ponto 2...</li>
    </ul>
  </div>
</div>

G) Tabela Didática de Alto Impacto:
<div class="overflow-x-auto my-6">
  <table class="w-full text-left border-collapse rounded-xl overflow-hidden shadow-sm">
    <thead>
      <tr class="bg-slate-900 text-white text-xs uppercase tracking-wider">
        <th class="p-3.5 border-b border-slate-800">Critério / Categoria</th>
        <th class="p-3.5 border-b border-slate-800">Característica Principal</th>
        <th class="p-3.5 border-b border-slate-800">Aplicação Prática</th>
      </tr>
    </thead>
    <tbody class="text-sm divide-y divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <tr>
        <td class="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Linha 1</td>
        <td class="p-3.5">Descrição 1...</td>
        <td class="p-3.5">Exemplo 1...</td>
      </tr>
    </tbody>
  </table>
</div>

H) Card Mnemônico Interativo:
<div class="mnemonico-card">
  <div class="mnemonico-title">🧠 MNEMÔNICO: NOME DO MACETE (SIGLA)</div>
  <div class="mnemonico-grid">
    <span title="Significado"><strong>S</strong>igla 1</span>
    <span title="Significado"><strong>I</strong>tem 2</span>
    <span title="Significado"><strong>G</strong>rupo 3</span>
  </div>
</div>

I) Fórmulas Matemáticas & RLM (KaTeX Dark Block — SEM onclick inline):
<div class="math-card-block" data-latex="P \\rightarrow Q \\equiv \\neg P \\vee Q">
  <div class="math-card-header">
    <span class="math-badge">⚡ EQUAÇÃO / FÓRMULA / REGRA DE RLM</span>
    <button type="button" class="btn-copy-math">📋 Copiar LaTeX</button>
  </div>
  <div class="math-card-body font-mono text-xl text-emerald-300">
    $$ P \\rightarrow Q \\equiv \\neg P \\vee Q $$
  </div>
</div>

J) Gráfico de Incidência do Assunto na Banca (CSS Bar Chart purge-safe, sem style inline):
Use OBRIGATORIAMENTE uma das classes de largura seguras validadas pelo Linter (\`chart-pct-5\` até \`chart-pct-100\` de 5 em 5, além de \`chart-pct-33\`, \`chart-pct-67\`, \`chart-pct-92\`) e cores (\`bg-emerald-500\`, \`bg-sky-500\`, \`bg-blue-500\`, \`bg-purple-500\`, \`bg-amber-500\`, \`bg-rose-500\`, \`bg-indigo-500\`, \`bg-teal-500\`):
<div class="chart-card">
  <div class="chart-title">📊 Incidência deste Tema nas Bancas Examinadoras</div>
  <div class="chart-bars space-y-3">
    <div class="chart-row">
      <span class="chart-label">Tópico Mais Cobrado</span>
      <div class="chart-bar-bg"><div class="chart-bar-fill bg-emerald-500 chart-pct-92"></div></div>
      <span class="chart-val">92% (Altíssima)</span>
    </div>
    <div class="chart-row">
      <span class="chart-label">Segundo Tópico</span>
      <div class="chart-bar-bg"><div class="chart-bar-fill bg-sky-500 chart-pct-85"></div></div>
      <span class="chart-val">85% (Altíssima)</span>
    </div>
    <div class="chart-row">
      <span class="chart-label">Terceiro Tópico</span>
      <div class="chart-bar-bg"><div class="chart-bar-fill bg-purple-500 chart-pct-80"></div></div>
      <span class="chart-val">80% (Alta)</span>
    </div>
  </div>
</div>

J.2) Diagrama de Venn (RLM / Conjuntos / Interseções Jurídicas):
<div class="venn-diagram-card">
  <div class="venn-title">⭕ DIAGRAMA DE VENN: INTERSEÇÃO DE CONCEITOS</div>
  <svg viewBox="0 0 360 180" class="w-full max-w-md mx-auto" role="img" aria-label="Diagrama de Venn comparativo">
    <circle cx="135" cy="90" r="65" class="venn-circle venn-left" />
    <circle cx="225" cy="90" r="65" class="venn-circle venn-right" />
    <text x="105" y="92" class="venn-text">Conjunto A</text>
    <text x="255" y="92" class="venn-text">Conjunto B</text>
    <text x="180" y="95" class="venn-inter-text">A ∩ B</text>
  </svg>
  <p class="venn-caption">Legenda explicativa da área de interseção cobrada em prova.</p>
</div>

K) Fluxogramas e Roteiros de Processo (Horizontal, Vertical e Misto):

1) Modelo Horizontal (Sequencial Padrão):
<div class="process-stepper">
  <div class="process-title">🔄 TRILHA DE APRENDIZAGEM / PASSO A PASSO</div>
  <div class="stepper-grid">
    <div class="step-card">
      <div class="step-num">1</div>
      <strong>Fase 1: Instauração</strong>
      <span>Descrição da primeira etapa...</span>
    </div>
    <div class="step-arrow">➔</div>
    <div class="step-card">
      <div class="step-num">2</div>
      <strong>Fase 2: Inquérito</strong>
      <span>Descrição da segunda etapa...</span>
    </div>
    <div class="step-arrow">➔</div>
    <div class="step-card">
      <div class="step-num">3</div>
      <strong>Fase 3: Julgamento</strong>
      <span>Descrição da terceira etapa...</span>
    </div>
  </div>
</div>

2) Modelo Vertical (Sequência Vertical Aprofundada):
<div class="process-stepper">
  <div class="process-title">📋 ROTEIRO SEQUENCIAL VERTICAL</div>
  <div class="stepper-vertical">
    <div class="step-card">
      <div class="step-num">1</div>
      <div>
        <strong>Passo 1: Requerimento Inicial</strong>
        <p class="mt-1 text-slate-300">Detalhamento completo do pedido inicial...</p>
      </div>
    </div>
    <div class="step-arrow">➔</div>
    <div class="step-card">
      <div class="step-num">2</div>
      <div>
        <strong>Passo 2: Análise Técnica</strong>
        <p class="mt-1 text-slate-300">Análise de admissibilidade e documentação...</p>
      </div>
    </div>
  </div>
</div>

3) Modelo Misto / Ramificado (Com Tomada de Decisão):
<div class="process-stepper">
  <div class="process-title">🔀 FLUXOGRAMA MISTO (DECISÃO & RAMIFICAÇÕES)</div>
  <div class="stepper-mixed">
    <div class="step-card">
      <div class="step-num">1</div>
      <strong>Etapa 1: Cenário Inicial</strong>
      <span>Descrição da situação fática ou jurídica...</span>
    </div>
    <div class="step-arrow-v">⬇</div>
    <div class="step-card-decision">
      <div class="step-num">?</div>
      <strong class="text-amber-300 text-sm">Decisão: Pergunta-Chave de Diagnóstico?</strong>
      <p class="text-slate-300">Critério normativo ou doutrinário para ramificação.</p>
    </div>
    <div class="stepper-branch-split">
      <span class="text-emerald-400 flex items-center gap-1">↙ SE SIM</span>
      <span class="text-slate-600 dark:text-slate-700">|</span>
      <span class="text-rose-400 flex items-center gap-1">SE NÃO ↘</span>
    </div>
    <div class="stepper-branch-container">
      <div class="step-card-yes">
        <div class="branch-label-yes">✅ SE SIM</div>
        <div class="step-num">2A</div>
        <strong>Consequência Jurídica A</strong>
        <p class="text-slate-300">Explicação do primeiro caminho.</p>
      </div>
      <div class="step-card-no">
        <div class="branch-label-no">❌ SE NÃO</div>
        <div class="step-num">2B</div>
        <strong>Consequência Jurídica B</strong>
        <p class="text-slate-300">Explicação do segundo caminho.</p>
      </div>
    </div>
  </div>
</div>

L) Evocação Ativa / Perguntas Spoiler (Sanfonados HTML5):
<details class="estudo-spoiler mb-4">
  <summary>❓ Pergunta de Fixação: Pergunta direta sobre o tópico?</summary>
  <div class="spoiler-conteudo">
    <p>✅ <strong>Resposta:</strong> Explicação detalhada da resposta com fundamento legal...</p>
  </div>
</details>

M) Blocos de Questões de Concurso no Corpo do Texto:
1) Modelo Certo ou Errado:
<div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 mb-6">
  <div class="flex items-center gap-2 mb-3">
    <span class="px-2.5 py-1 text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg">
      CEBRASPE / CERTO OU ERRADO
    </span>
    <span class="text-xs text-slate-500">Questão 01</span>
  </div>
  <p class="text-slate-800 dark:text-slate-200 font-medium text-sm mb-4 leading-relaxed">
    Acerca do assunto abordado nesta seção, julgue o item a seguir:
  </p>
  <blockquote class="p-4 my-3 bg-white dark:bg-slate-900 border-l-4 border-sky-500 text-sm text-slate-700 dark:text-slate-300 rounded-r-xl italic">
    "Texto entre aspas da assertiva jurídica ou técnica a ser julgada..."
  </blockquote>
  <details class="estudo-spoiler mt-4">
    <summary class="cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
      🔍 Clique para ver o Gabarito e Comentário Detalhado
    </summary>
    <div class="spoiler-conteudo mt-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-sm">
      <p class="font-bold text-rose-600 dark:text-rose-400 text-base mb-2">❌ Gabarito: ERRADO</p>
      <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
        <strong>Comentário Detalhado:</strong> Explicação aprofundada da pegadinha da banca, fundamentação legal, artigo de lei ou jurisprudência...
      </p>
    </div>
  </details>
</div>

2) Modelo Múltipla Escolha:
<div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 mb-6">
  <div class="flex items-center gap-2 mb-3">
    <span class="px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
      FGV / MÚLTIPLA ESCOLHA
    </span>
    <span class="text-xs text-slate-500">Questão 02</span>
  </div>
  <p class="text-slate-800 dark:text-slate-200 font-medium text-sm mb-3 leading-relaxed">
    Texto do caso prático ou contexto hipotético apresentado pela banca examinadora...
  </p>
  <p class="text-slate-800 dark:text-slate-200 text-sm mb-4">
    Considerando as disposições normativas sobre a matéria, assinale a alternativa correta:
  </p>
  <ul class="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-4 pl-2">
    <li><strong>A)</strong> Primeira opção de resposta...</li>
    <li><strong>B)</strong> Segunda opção de resposta...</li>
    <li><strong>C)</strong> Terceira opção de resposta...</li>
    <li><strong>D)</strong> Quarta opção de resposta...</li>
    <li><strong>E)</strong> Quinta opção de resposta...</li>
  </ul>
  <details class="estudo-spoiler mt-4">
    <summary class="cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
      🔍 Clique para ver o Gabarito e Comentário Detalhado
    </summary>
    <div class="spoiler-conteudo mt-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-sm">
      <p class="font-bold text-emerald-600 dark:text-emerald-400 text-base mb-2">✅ Gabarito: B</p>
      <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
        <strong>Comentário Detalhado:</strong> Comentário ponto a ponto explicando por que a opção escolhida está correta e por que as demais estão erradas...
      </p>
    </div>
  </details>
</div>

---

🖼️ 3. GERAÇÃO, OTIMIZAÇÃO WEBP E UPLOAD PARA O SUPABASE STORAGE (\`article-media\`):
1. Gere uma Imagem Destacada de Capa (\`featured_image\`) com identidade visual editorial moderna compatível com o tema do artigo.
2. Quando adequado para a aprendizagem, gere imagens didáticas (esquemas, fluxos, quadros comparativos, gráficos ou mnemônicos visuais) para ilustrar os tópicos principais do artigo.
3. Converta todas as imagens geradas (capa e ilustrações internas) para o formato WebP otimizado (máx. 1200px de dimensão, qualidade ~82%).
4. Faça upload das imagens WebP para o bucket público \`article-media\` do Supabase Storage (\`covers/<slug>-capa.webp\` para a capa e \`content/<slug>-fig-X.webp\` para as imagens do corpo) e utilize a URL pública HTTPS (\`https://<project_ref>.supabase.co/storage/v1/object/public/article-media/...\`) no \`featured_image\` e nas tags \`<img>\`. Utilize Data URI (\`data:image/webp;base64,...\`) apenas como fallback caso o upload via Storage não esteja disponível (o Linter penaliza \`data:image/\` em \`featured_image\` devido ao \`og:image\`).
5. Insira as imagens do corpo diretamente nas seções adequadas do \`content_html\` com Texto Alternativo (Alt SEO) e Legenda Visível (\`figcaption\`):
<figure class="my-6 text-center">
  <img src="https://ovpyjsjvowhhyxvwbedh.supabase.co/storage/v1/object/public/article-media/content/..." alt="Texto Alternativo descritivo para SEO" loading="lazy" decoding="async" class="rounded-2xl max-w-full mx-auto border border-slate-200 dark:border-slate-800 shadow-md" />
  <figcaption class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium italic text-center">Figura X: Legenda visível explicativa.</figcaption>
</figure>

---

🎯 4. FERRAMENTAS DE ESTUDO INTERATIVAS (SRS SM-2, CADERNO DE ERROS E MODO PROVA):
Monte o objeto estruturado \`study_data\` (validado por \`validateStudyMetadata\` em \`src/lib/studyMetadataSchema.ts\`) contendo obrigatoriamente:
1. \`flashcards\`: Mínimo de 8 a 10 flashcards (\`{ id: "fc-1", question, answer, category, bancaTip }\`) para alimentar o sistema de Repetição Espaçada (SRS SM-2) em \`/minha-revisao\`.
2. \`questions\` (Questões de Provas Pretéritas/Estilo Banca): Mínimo de 4 questões (\`{ id: "q-1", banca, ano, orgao, type, statement, options, correctIndex, explanation }\`), mesclando \`"certo_errado"\` (2 opções: \`["Certo", "Errado"]\`, \`correctIndex\` \`0\` ou \`1\`) e \`"multipla_escolha_5"\` (5 opções de A a E sem duplicar o prefixo \`"A) "\` no texto da opção, com \`correctIndex\` numérico estritamente entre \`0\` e \`4\`).
3. \`simulados\` (Questões Inéditas do Artigo para Modo Prova / Líquido Cebraspe): Mínimo de 3 questões inéditas (\`{ id: "sim-1", type, statement, options, correctIndex, explanation }\`), mesclando \`"multipla_escolha_4"\` (4 opções inéditas sem prefixo \`"A) "\`, \`correctIndex\` estritamente entre \`0\` e \`3\`) e \`"certo_errado"\` (2 opções: \`["Certo", "Errado"]\`, \`correctIndex\` \`0\` ou \`1\`).
4. \`infographics\`: \`[]\` (ou lista de infográficos interativos tipados conforme \`InfographicItem\`).

Para total retrocompatibilidade com o Editor Admin, anexe também ao final do \`content_html\`:
- \`<!-- TAGS: Tag1, Tag2, Tag3, ... -->\`
- \`<!-- STATUS: published -->\`
- \`<!-- STUDY_DATA_JSON_B64: <encodeURIComponent(JSON.stringify(study_data))> -->\`

---

🚀 5. METADADOS, COLUNAS ESTRUTURADAS (FASE 3/4) E PUBLICAÇÃO DIRETA NO SUPABASE:
1. Defina os metadados respeitando as faixas ideais do Linter Semântico (\`runSemanticLinter\`):
   - \`title\`: Título forte, claro e atrativo (**entre 40 e 68 caracteres**; limite do Linter: 20 a 90 caracteres).
   - \`slug\`: URL amigável normalizada estritamente em kebab-case minúsculo sem acentos (\`^[a-z0-9]+(?:-[a-z0-9]+)*$\`).
   - \`category_slug\`: \`"estude"\` (ou \`"aprenda"\`, \`"estude-comigo"\`, \`"informe-se"\`, \`"rotina"\`).
   - \`subcategory\`: Disciplina/Matéria exata (garanta também seu registro na tabela \`public.subcategories\`).
   - \`banca\`: Nome da banca se o artigo focar em uma banca específica, ou \`null\` se for multi-banca.
   - \`summary\`: Resumo denso e persuasivo para SEO e OpenGraph (**entre 140 e 240 caracteres**; limite do Linter: 100 a 280 caracteres).
   - \`read_time\`: Calculado sobre o texto limpo ANTES dos comentários finais (\`\${Math.max(1, Math.ceil(palavras / 200))} min de leitura\`).
   - \`featured_image\`: URL pública HTTPS da capa WebP no bucket \`article-media\` (ou Data URI WebP de fallback).
   - \`is_published\`: \`true\`.
   - \`status\`: \`"published"\`.
   - \`scheduled_at\`: \`null\`.
   - \`tags\`: Array nativo \`text[]\` com 8 a 12 tags otimizadas para SEO e busca na Home.
   - \`study_data\`: Objeto JSONB completo \`{ flashcards, questions, simulados, infographics }\`.
   - \`flashcards_count\`: \`study_data.flashcards.length\` (exibido nos cards da Home, que não trafegam mais \`content_html\`).
   - \`questions_count\`: \`study_data.questions.length\` (exibido nos cards da Home).
   - \`simulados_count\`: \`study_data.simulados.length\` (exibido nos cards da Home).
   - \`infographics_count\`: \`study_data.infographics.length\` (exibido nos cards da Home).
2. Insira (ou atualize via \`ON CONFLICT (slug)\`) o registro completo na tabela \`public.posts\` do Supabase (e, se houver infográficos em \`study_data.infographics\`, sincronize-os na tabela \`public.post_infographics\`).
3. Valide o artigo com as regras do \`runSemanticLinter\` e confirme no banco se todas as colunas estruturadas e contadores foram gravados com sucesso.
4. Ao finalizar, apresente no chat um resumo executivo da publicação (Título, Slug/URL, Score do Linter Semântico, Categoria/Subcategoria, URLs das imagens e contagens de flashcards, questões e simulados).

Segue texto:
`;

/**
 * Helper para gerar um prompt completo para a IA com base em um tema ou texto de artigo
 */
export function buildArticleAiPrompt(tema: string, banca?: string): string {
  return `${AI_SYSTEM_PROMPT_ARTIGOS}
Tema central: "${tema}"${banca ? ` (Foco na banca examinadora: ${banca})` : ""}
`;
}
