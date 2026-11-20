/**
 * DIRETRIZES DE FORMATAÇÃO VISUAL, DESIGN SYSTEM SEMÂNTICO E PUBLICAÇÃO AUTOMATIZADA
 * Blog Concurseiro Focado — Pipeline Completo (Redação + Imagens WebP + Ferramentas de Estudo + Publicação Supabase)
 */

export const AI_SYSTEM_PROMPT_ARTIGOS = `Compreenda o Design System Semântico e a arquitetura de publicação do projeto no código (\`src/app/globals.css\`, \`src/data/ai_prompt_instructions.ts\`, \`src/app/admin/page.tsx\`, \`src/app/artigo/[slug]/page.tsx\` e \`src/components/InteractiveStudyModal.tsx\`).

Analise o texto-base a seguir, compreenda todas as informações e execute TODO O PROCESSO DE PONTA A PONTA ATÉ A PUBLICAÇÃO DIRETA NO SUPABASE, seguindo rigorosamente as diretrizes abaixo:

---

🚨 1. REGRAS CRÍTICAS DE SINTAXE, TÍTULOS E ESTILO:
1. NUNCA utilize atributos \`style="..."\` ou CSS inline em nenhuma tag HTML.
2. NUNCA inclua blocos de \`<style>...</style>\`, \`<!DOCTYPE>\`, \`<html>\`, \`<head>\` ou \`<body>\`.
3. NÃO insira a tag \`<h1>\` no \`content_html\` (o título principal já é renderizado pelo cabeçalho da página do artigo).
4. Os demais títulos e subtítulos (\`<h2>\`, \`<h3>\`, \`<h4>\`) NÃO precisam e NÃO devem conter numeração, ícones ou emojis.
5. NUNCA utilize entidades HTML codificadas como \`&gt;\`, \`&lt;\` ou \`&amp;\` no texto. Escreva texto em UTF-8 puro.
6. Utilize as classes semânticas do Design System oficial do blog listadas abaixo e, quando adequado para a aprendizagem do conteúdo, crie recursos educativos visuais novos (ex.: escalas visuais, bússolas de decisão ramificadas, laboratórios de prova discursiva comentada com espelho de correção em spoilers).
7. Escreva um artigo completo, denso, extremamente didático e focado em aprovação, sem omitir nenhum detalhe técnico, doutrinário, jurisprudencial ou legal do texto-base.

---

📋 2. CATÁLOGO DE ELEMENTOS VISUAIS E COMPONENTES SEMÂNTICOS:

A) Parágrafo de Introdução (Destaque Lead):
<p class="lead text-lg font-medium text-slate-700 dark:text-slate-300 mb-6">
  Escreva aqui a introdução envolvente, contextualizando a importância do tema nas provas...
</p>

B) Títulos e Subtítulos Limpos (Sem numeração, sem ícones e sem emojis):
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

E) Dispositivo Legal / Vade Mecum (Caixa Púrpura):
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

I) Fórmulas Matemáticas & RLM (KaTeX Dark Block):
<div class="math-card-block">
  <div class="math-card-header">
    <span class="math-badge">⚡ EQUAÇÃO / FÓRMULA / REGRA DE RLM</span>
  </div>
  <div class="math-card-body font-mono text-xl text-emerald-300">
    Fórmula ou Equação em texto ou KaTeX...
  </div>
</div>

J) Gráfico de Incidência do Assunto na Banca (CSS Bar Chart sem style inline):
Use APENAS as classes seguras de largura (\`chart-pct-5\` até \`chart-pct-100\` de 5 em 5, mais \`chart-pct-33\`, \`chart-pct-67\`, \`chart-pct-92\`) e cores (\`bg-emerald-500\`, \`bg-sky-500\`, \`bg-blue-500\`, \`bg-purple-500\`, \`bg-amber-500\`, \`bg-rose-500\`, \`bg-indigo-500\`, \`bg-teal-500\`):
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

🖼️ 3. GERAÇÃO, OTIMIZAÇÃO WEBP E INSERÇÃO DE IMAGENS (CAPA + CORPO):
1. Gere uma Imagem Destacada de Capa (\`featured_image\`) com identidade visual editorial moderna compatível com o tema do artigo.
2. Quando adequado para a aprendizagem, gere imagens didáticas (esquemas, fluxos, quadros comparativos, gráficos ou mnemônicos visuais) para ilustrar os tópicos principais do artigo.
3. Converta todas as imagens geradas (capa e ilustrações internas) para o formato WebP otimizado (máx. 1200px de dimensão, qualidade ~82%) codificado em Data URI (\`data:image/webp;base64,...\`), seguindo o padrão do \`ImageUploadModal.tsx\`.
4. Insira as imagens do corpo diretamente nas seções adequadas do \`content_html\` com Texto Alternativo (Alt SEO) e Legenda Visível (\`figcaption\`):
<figure class="my-6 text-center">
  <img src="data:image/webp;base64,..." alt="Texto Alternativo descritivo para SEO" loading="lazy" decoding="async" class="rounded-2xl max-w-full mx-auto border border-slate-200 dark:border-slate-800 shadow-md" />
  <figcaption class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium italic text-center">Figura X: Legenda visível explicativa.</figcaption>
</figure>

---

🎯 4. FERRAMENTAS DE ESTUDO INTERATIVAS E TAGS (BLOCO FINAL DO \`content_html\`):
Ao final do \`content_html\`, insira obrigatoriamente os comentários estruturais para alimentar as ferramentas interativas do artigo:
- \`<!-- TAGS: Tag1, Tag2, Tag3, ... -->\` (8 a 12 tags otimizadas para SEO e busca interna)
- \`<!-- STATUS: published -->\`
- \`<!-- STUDY_DATA_JSON_B64: <encodeURIComponent(JSON.stringify(studyDataJson))> -->\` (codificado com \`encodeURIComponent\`, sem necessidade de duplicar o JSON em comentário secundário), contendo:
  1. \`flashcards\`: Mínimo de 8 a 10 flashcards (\`{ id, question, answer, category, bancaTip }\`).
  2. \`questions\` (Questões de Provas/Estilo Banca): Mínimo de 4 questões (\`{ id, banca, ano, orgao, type, statement, options, correctIndex, explanation }\`), mesclando \`"certo_errado"\` (2 opções: \`["Certo", "Errado"]\`) e \`"multipla_escolha_5"\` (5 opções de A a E sem duplicar o prefixo \`"A) "\` no texto da opção, com \`correctIndex\` numérico de \`0\` a \`4\`).
  3. \`simulados\` (Questões Inéditas do Artigo): Mínimo de 3 questões inéditas (\`{ id, type, statement, options, correctIndex, explanation }\`), mesclando \`"multipla_escolha_4"\` (4 opções inéditas, \`correctIndex\` de \`0\` a \`3\`) e \`"certo_errado"\` (2 opções: \`["Certo", "Errado"]\`, \`correctIndex\` \`0\` ou \`1\`).
  4. \`infographics\`: \`[]\` (ou lista de infográficos interativos se aplicável).

---

🚀 5. METADADOS E PUBLICAÇÃO DIRETA NO SUPABASE:
1. Defina automaticamente os metadados do artigo:
   - \`title\`: Título forte, claro e atrativo para concurseiros.
   - \`slug\`: URL amigável normalizada (kebab-case, sem acentos ou caracteres especiais).
   - \`category_slug\`: \`"estude"\` (ou \`"aprenda"\`, \`"estude-comigo"\`, \`"informe-se"\`, \`"rotina"\`).
   - \`subcategory\`: Disciplina/Matéria exata (garanta também que ela exista na tabela \`public.subcategories\`).
   - \`banca\`: Nome da banca se o texto focar em uma banca específica, ou \`null\` se for multi-banca.
   - \`summary\`: Resumo denso e persuasivo (150 a 260 caracteres) para o card da Home e meta description SEO.
   - \`read_time\`: Calculado com base no total de palavras (\`\${Math.max(1, Math.ceil(palavras / 200))} min de leitura\`).
   - \`featured_image\`: Data URI WebP da imagem de capa gerada (ou URL HTTPS otimizada no Storage).
   - \`is_published\`: \`true\`.
2. Insira (ou atualize, se o \`slug\` já existir) o registro completo diretamente na tabela \`public.posts\` do Supabase configurado no ambiente e valide se a gravação foi concluída com sucesso.
3. Ao finalizar, apresente no chat um resumo executivo da publicação (Título, Slug/URL, Categoria/Subcategoria, quantidade de imagens, flashcards, questões e simulados cadastrados).

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
