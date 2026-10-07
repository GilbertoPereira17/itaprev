/** Módulos do painel que podem ser liberados por usuário (perfil Editor). Administradores acessam tudo. */
export const MODULES = {
  noticias: "Notícias",
  paginas: "Páginas de texto",
  documentos: "Documentos",
  slides: "Banner da página inicial",
  faq: "Perguntas frequentes",
  mensagens: "Mensagens e Ouvidoria",
  chatbot: "Assistente virtual (Ita)",
  configuracoes: "Contatos e links",
} as const;

export type ModuleKey = keyof typeof MODULES;
export const MODULE_KEYS = Object.keys(MODULES) as ModuleKey[];

/** Converte o texto salvo no banco ("noticias,documentos") em lista válida */
export function parseModules(value: string): ModuleKey[] {
  return value.split(",").map((s) => s.trim()).filter((s): s is ModuleKey => s in MODULES);
}

export function canAccess(user: { role: string; modules: ModuleKey[] }, mod: ModuleKey) {
  return user.role === "admin" || user.modules.includes(mod);
}
