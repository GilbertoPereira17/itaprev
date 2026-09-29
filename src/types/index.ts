export type AudienceType = 'todos' | 'aposentados' | 'pensionistas' | 'ativos' | 'cidadao';

export interface ServiceItem {
  id: string;
  title: string;
  shortDescription: string;
  iconName: string;
  audience: AudienceType[];
  actionLabel: string;
  actionUrl: string;
  isExternal: boolean;
  highlight?: boolean;
  tag?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  imageUrl?: string;
  slug: string;
  featured?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'pagamento' | 'recadastramento' | 'beneficios' | 'geral';
}

export interface CouncilMember {
  role: string;
  name: string;
  representation: string;
}

export interface CouncilData {
  title: string;
  description: string;
  members: CouncilMember[];
  meetingsScheduleUrl?: string;
  minutesUrl?: string;
  lawsUrl?: string;
}
