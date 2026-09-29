import { NewsArticle } from "@/types";

export const NEWS_DATA: NewsArticle[] = [
  {
    id: "audiencia-publica-2026",
    title: "Audiência Pública 2026: Prestação de Contas e Resultados Previdenciários",
    summary: "O Instituto de Previdência de Itanhaém convida todos os servidores públicos, aposentados e a sociedade civil para a apresentação do relatório de gestão e investimentos.",
    date: "18/08/2026",
    category: "Audiência Pública",
    imageUrl: "/images/noticia-audiencia.jpg",
    slug: "audiencia-publica-2026",
    featured: true,
  },
  {
    id: "certificacao-pro-gestao",
    title: "Itanhaém Prev mantém a certificação Pró-Gestão RPPS Nível II",
    summary: "A certificação do Ministério da Previdência atesta a adoção de práticas de governança e controle na gestão do regime próprio. Entenda o que isso representa para o segurado.",
    date: "24/04/2026",
    category: "Institucional",
    imageUrl: "/images/noticia-trofeu.jpg",
    slug: "certificacao-pro-gestao",
    featured: true,
  },
  {
    id: "recadastramento-censo",
    title: "Recadastramento Previdenciário Anual: Passo a Passo e Canais de Suporte",
    summary: "Aposentados e pensionistas devem realizar a atualização cadastral periódica para manter a regularidade do pagamento. Veja como fazer sem sair de casa.",
    date: "31/10/2025",
    category: "Segurados",
    imageUrl: "/images/noticia-censo.jpg",
    slug: "recadastramento-censo",
    featured: false,
  },
];
