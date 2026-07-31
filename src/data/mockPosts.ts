export interface InfographicItem {
  id: number;
  title: string;
  subtitle: string;
  summary: string;
  points: string[];
  type: "mapa_mental" | "resumo_visual" | "tabela_comparativa" | "codigo_html";
  codeContent?: string;
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
  updatedAt?: string;
  readTime: string;
  youtubeVideoId?: string;
  flashcardsCount?: number;
  questionsCount?: number;
  simuladosCount?: number;
  infographicsCount?: number;
  featuredImage: string;
  tags?: string[];
  infographics?: InfographicItem[];
  questions?: any[];
  simulados?: any[];
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

export const MOCK_POSTS: Post[] = [];

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
