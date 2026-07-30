export interface InfographicItem {
  id: number;
  title: string;
  subtitle: string;
  summary: string;
  points: string[];
  type: "mapa_mental" | "resumo_visual" | "tabela_comparativa";
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: "Estude" | "Aprenda" | "Estude comigo" | "Informe-se" | "Rotina";
  subcategory?: string;
  banca?: string;
  summary: string;
  content: string;
  publishedAt: string;
  readTime: string;
  youtubeVideoId?: string;
  flashcardsCount?: number;
  questionsCount?: number;
  infographicsCount?: number;
  featuredImage: string;
  tags?: string[];
  infographics?: InfographicItem[];
  questions?: any[];
}

export interface AppProduct {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: string;
  pricingType: "Assinatura" | "Pagamento Único" | "Em Breve (Fase de Testes)";
  status: "Em Testes" | "Disponível";
  iconName: string;
  features: string[];
}

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Como Utilizar o Método de Repetição Espaçada com Flashcards no Estudo para Concursos",
    slug: "metodo-repeticao-espacada-flashcards-concursos",
    category: "Aprenda",
    summary: "Descubra como a curva do esquecimento de Ebbinghaus afeta sua memorização e como implementar flashcards de forma prática na sua rotina diária de estudos.",
    content: `
      <h2>O Problema da Curva do Esquecimento</h2>
      <p>Estudar durante horas e esquecer 80% do conteúdo após uma semana é a frustração número um dos concurseiros. A neurociência da aprendizagem demonstra que a nossa memória de curto prazo descarta informações não revisadas rapidamente.</p>
      
      <div class="my-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-medium">
        📌 <strong>Regra de Ouro:</strong> Não basta ler a teoria uma vez; a revisão ativa com evocação rápida é o fator determinante de aprovação nas provas da Cebraspe, FGV e FCC.
      </div>

      <h2>Como o Método Funciona na Prática</h2>
      <p>Diferente de reeler grifos no material em PDF (que gera uma falsa ilusão de competência), o uso de <strong>flashcards interativos</strong> força seu cérebro a resgatar a resposta ativamente antes de virar o cartão.</p>

      <h3>Passo a Passo para Montar Flashcards Eficientes:</h3>
      <ol class="list-decimal pl-6 space-y-2">
        <li><strong>Um conceito por cartão:</strong> Evite cartões sobrecarregados com parágrafos longos.</li>
        <li><strong>Foco em Pegadinhas de Prova:</strong> Adicione exceções da lei, prazos e jurisprudência pacificada dos tribunais superiores (STF e STJ).</li>
        <li><strong>Consistência Diária:</strong> Reserve 20 a 30 minutos no início do seu dia de estudo apenas para zerar as revisões do dia.</li>
      </ol>
    `,
    publishedAt: "25 de Julho, 2026",
    readTime: "6 min de leitura",
    flashcardsCount: 12,
    questionsCount: 5,
    infographicsCount: 2,
    featuredImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    tags: ["Flashcards", "Memorização", "Revisão Espaçada", "Ebbinghaus"],
    infographics: [
      {
        id: 1,
        title: "Curva do Esquecimento de Ebbinghaus",
        subtitle: "Retenção de memória com e sem repetição espaçada",
        summary: "Sem revisão, retemos apenas 20% do aprendizado após 48h. Com revisões em 24h, 7 dias e 30 dias, a retenção se consolida na memória de longo prazo acima de 90%.",
        points: [
          "24 horas: Primeira revisão ativa (restaura retenção a 100%)",
          "7 dias: Segunda revisão rápida com flashcards",
          "30 dias: Consolidação permanente na memória de longo prazo",
          "Evocação Ativa: Esforçar o cérebro fortalece conexões neurais"
        ],
        type: "mapa_mental"
      },
      {
        id: 2,
        title: "Anatomia de um Flashcard Perfeito",
        subtitle: "Como estruturar perguntas e respostas sem poluição visual",
        summary: "Regra atômica: um cartão deve testar apenas um conceito ou exceção de lei de cada vez.",
        points: [
          "Frente: Pergunta objetiva e direta sobre a regra ou pegadinha",
          "Verso: Resposta direta em poucas palavras + artigo de lei/base jurídica",
          "Evitar: Textos longos ou resumos inteiros no verso"
        ],
        type: "resumo_visual"
      }
    ]
  },
  {
    id: "2",
    title: "Direito Constitucional: Controle de Constitucionalidade Descomplicado para Provas",
    slug: "direito-constitucional-controle-de-constitucionalidade",
    category: "Estude",
    subcategory: "Direito Constitucional",
    banca: "Cebraspe",
    summary: "Resumo esquematizado das diferenças entre o Controle Difuso e Concentrado de Constitucionalidade, legitimados do Art. 103 e pegadinhas de bancas.",
    content: `
      <h2>1. Controle Difuso vs. Controle Concentrado</h2>
      <p>O controle de constitucionalidade é um dos temas mais cobrados em concursos de nível superior e carreiras de tribunais. Vamos esquematizar de forma direta:</p>

      <table class="w-full my-6 text-sm text-left border border-slate-200 dark:border-slate-800">
        <thead class="bg-slate-100 dark:bg-slate-800 font-semibold">
          <tr>
            <th class="p-3 border">Critério</th>
            <th class="p-3 border">Controle Difuso</th>
            <th class="p-3 border">Controle Concentrado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border font-semibold">Quem realiza?</td>
            <td class="p-3 border">Qualquer juiz ou tribunal</td>
            <td class="p-3 border">STF (âmbito federal) ou TJ (âmbito estadual)</td>
          </tr>
          <tr>
            <td class="p-3 border font-semibold">Via de acesso</td>
            <td class="p-3 border">Incidental (defesa em caso concreto)</td>
            <td class="p-3 border">Principal (Ação direta: ADI, ADC, ADPF)</td>
          </tr>
          <tr>
            <td class="p-3 border font-semibold">Efeitos da decisão</td>
            <td class="p-3 border">Inter partes (regra geral)</td>
            <td class="p-3 border">Erga omnes e vinculante</td>
          </tr>
        </tbody>
      </table>

      <div class="my-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
        💡 <strong>Dica de Ouro para Cebraspe:</strong> Lembre-se que no controle concentrado no STF, os legitimados universais não precisam demonstrar pertinência temática, enquanto os legitimados especiais (ex: Confederação Sindical) devem demonstrar!
      </div>
    `,
    publishedAt: "24 de Julho, 2026",
    readTime: "8 min de leitura",
    flashcardsCount: 15,
    questionsCount: 8,
    infographicsCount: 2,
    featuredImage: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=800&auto=format&fit=crop&q=80",
    tags: ["Direito Constitucional", "Controle de Constitucionalidade", "Cebraspe", "Artigo 103 CF", "STF"],
    infographics: [
      {
        id: 1,
        title: "Mapa Mental: Legitimados da ADI (Art. 103 CF/88)",
        subtitle: "Divisão entre Legitimados Universais e Especiais",
        summary: "Legitimados Universais não precisam de pertinência temática. Legitimados Especiais DEVEM comprovar vínculo com a matéria.",
        points: [
          "Universais (3 P's e 3 Mesas): Presidente, PGR, OAB, Mesa do Senado, Mesa da Câmara, Partidos Políticos com representação",
          "Especiais (Necessitam Pertinência): Governadores, Mesas de Assembleias Legislativas, Confederação Sindical/Entidade de Classe Nacional"
        ],
        type: "mapa_mental"
      },
      {
        id: 2,
        title: "Esquema Visual: Efeitos das Ações Diretas no STF",
        subtitle: "Efeitos no tempo e vinculação dos órgãos",
        summary: "Regra geral: Nulidade Ex Tunc + Erga Omnes + Efeito Vinculante para o Poder Judiciário e Administração Pública.",
        points: [
          "Ex Tunc: Efeitos retroativos à data da publicação da lei inconstitucional",
          "Erga Omnes: Eficácia contra todos",
          "Vinculante: Obriga o Judiciário e a Administração (NÃO vincula o Poder Legislativo na sua função de legislar!)"
        ],
        type: "tabela_comparativa"
      }
    ]
  },
  {
    id: "3",
    title: "Study With Me #14: 4 Horas de Estudo Intensivo com Resolução de Questões na Prática",
    slug: "study-with-me-14-estudo-intensivo-questoes",
    category: "Estude comigo",
    summary: "Confira a sessão completa de estudo focado, aplicando a técnica Pomodoro adaptada, montagem de mapas mentais ao vivo e aplicativo de revisão.",
    content: `
      <h2>Sobre este Vídeo de Estudo</h2>
      <p>Neste episódio da série <em>Study With Me</em>, gravei todo o meu bloco diário de estudos focado na resolução de 50 questões da banca FGV e revisão dos meus cartões de memória acumulados.</p>
      
      <p>Diferente de sessões de estudo estáticas, neste vídeo mostro na tela a ferramenta que utilizo para cronometrar meus ciclos e a estrutura do meu caderno de erros.</p>
    `,
    publishedAt: "22 de Julho, 2026",
    readTime: "4 min de leitura",
    youtubeVideoId: "dQw4w9WgXcQ",
    featuredImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    infographics: [
      {
        id: 1,
        title: "Fluxo do Estudo Focado no Vídeo",
        subtitle: "Ciclo de 4 horas dividido em blocos produtivos",
        summary: "Divisão do tempo do vídeo: 50 min teoria ativa + 10 min pausa + 50 min questões FGV + 50 min caderno de erros.",
        points: [
          "Bloco 1: Leitura focada no artigo de lei",
          "Bloco 2: Resolução de bateria de questões",
          "Bloco 3: Registro imediato de erros no Caderno Digital"
        ],
        type: "resumo_visual"
      }
    ]
  },
  {
    id: "4",
    title: "Panorama dos Editais Publicados em 2026: Vagas, Salários e Como Priorizar as Disciplinas",
    slug: "panorama-editais-publicados-2026-priorizacao",
    category: "Informe-se",
    summary: "Análise estratégica das principais bancas organizadoras, editais previstos para o segundo semestre e disciplinas interseccionais para estudar em bloco.",
    content: `
      <h2>Notícias & Estratégia de Editais</h2>
      <p>Com múltiplos editais sendo publicados em prazos curtos, a maior armadilha do concurseiro é tentar mudar o foco a cada novo edital que sai. A chave é manter o tronco comum de matérias (Constitucional, Administrativo, Português, Raciocínio Lógico e Informática).</p>
    `,
    publishedAt: "20 de Julho, 2026",
    readTime: "5 min de leitura",
    featuredImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80",
  }
];

export const MOCK_APPS: AppProduct[] = [
  {
    id: "app-1",
    name: "FocadoPlanner APP",
    slug: "focado-planner-app",
    tagline: "Gestão Inteligente de Ciclo de Estudos & Desempenho",
    description: "Aplicativo desenvolvido especialmente para concurseiros organizarem disciplinas por peso, cronometrarem horas líquidas reais e controlarem revisões automáticas.",
    price: "R$ 19,90/mês",
    pricingType: "Assinatura",
    status: "Em Testes",
    iconName: "Target",
    features: [
      "Ciclo de Estudos dinâmico por disciplinas",
      "Cronômetro de Horas Líquidas com pausa de foco",
      "Relatório de porcentagem de acertos em questões",
      "Agendamento inteligente de revisões espaçadas"
    ]
  },
  {
    id: "app-2",
    name: "Caderno de Erros Digital",
    slug: "caderno-de-erros-digital",
    tagline: "Transforme Questões Erradas em Aprovação",
    description: "Ferramenta para catalogar pegadinhas de bancas examinadoras e criar simulados personalizados apenas com o seu histórico de erros.",
    price: "R$ 47,00",
    pricingType: "Pagamento Único",
    status: "Em Testes",
    iconName: "BookOpen",
    features: [
      "Classificação por Banca e Matéria",
      "Registro da justificativa da pegadinha",
      "Exportação de revisões em PDF",
      "Modo de treino apenas com erros passados"
    ]
  }
];
