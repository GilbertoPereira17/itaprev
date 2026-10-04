/** Listas e rótulos das mensagens do site (fale conosco e ouvidoria) */

export const CONTACT_SUBJECTS = [
  "Dúvidas sobre holerite / pagamento",
  "Recadastramento / prova de vida",
  "Informe de rendimentos (IRPF)",
  "Simulação de aposentadoria",
  "Certidão de tempo de contribuição (CTC)",
  "Outros assuntos",
];

export const OMBUDSMAN_TYPES = [
  "Elogio",
  "Sugestão",
  "Reclamação",
  "Denúncia",
  "Solicitação de informação (LAI)",
  "Meus dados pessoais (LGPD)",
];

export const MESSAGE_STATUS: Record<string, string> = {
  nova: "Nova",
  em_andamento: "Em andamento",
  respondida: "Respondida",
  arquivada: "Arquivada",
};

export const STATUS_COLOR: Record<string, string> = {
  nova: "bg-amber-100 text-amber-800",
  em_andamento: "bg-blue-100 text-blue-800",
  respondida: "bg-emerald-100 text-emerald-800",
  arquivada: "bg-slate-100 text-slate-600",
};
