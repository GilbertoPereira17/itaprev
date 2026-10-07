import { pgTable, serial, text, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/** Usuários do painel administrativo */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("editor"), // admin | editor
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
    // Segurança da conta
    totpSecret: text("totp_secret").notNull().default(""), // segredo do 2FA (criptografado)
    totpEnabled: boolean("totp_enabled").notNull().default(false),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }).notNull().defaultNow(),
    mustChangePassword: boolean("must_change_password").notNull().default(false),
    // Módulos liberados para o perfil Editor (separados por vírgula). Administrador acessa tudo.
    modules: text("modules").notNull().default("noticias,paginas,documentos,slides,faq,mensagens,configuracoes"),
  },
  (t) => ({ emailIdx: uniqueIndex("users_email_idx").on(t.email) })
);

/** Configurações gerais (contatos, horários, links) — chave/valor */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: updatedAt(),
});

/** Slides do banner da Home */
export const slides = pgTable("slides", {
  id: serial("id").primaryKey(),
  tag: text("tag").notNull().default(""),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  buttonLabel: text("button_label").notNull().default(""),
  buttonUrl: text("button_url").notNull().default(""),
  imagePath: text("image_path").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: updatedAt(),
});

/** Notícias e comunicados */
export const news = pgTable(
  "news",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull().default("Institucional"),
    summary: text("summary").notNull().default(""),
    content: text("content").notNull().default(""), // HTML do editor
    coverPath: text("cover_path").notNull().default(""),
    published: boolean("published").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: updatedAt(),
  },
  (t) => ({ slugIdx: uniqueIndex("news_slug_idx").on(t.slug) })
);

/** Perguntas frequentes */
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

/** Páginas de texto editáveis (Institucional, Aposentados, Pensionistas...) */
export const pages = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    content: text("content").notNull().default(""),
    published: boolean("published").notNull().default(true),
    updatedAt: updatedAt(),
  },
  (t) => ({ slugIdx: uniqueIndex("pages_slug_idx").on(t.slug) })
);

/** Biblioteca de documentos: Seção (ex.: Conselho Fiscal) → Grupo (ex.: Atas 2026) → Documento (PDF) */
export const docSections = pgTable(
  "doc_sections",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    area: text("area").notNull().default("Transparência"), // agrupamento no menu
    sortOrder: integer("sort_order").notNull().default(0),
    published: boolean("published").notNull().default(true),
    updatedAt: updatedAt(),
  },
  (t) => ({ slugIdx: uniqueIndex("doc_sections_slug_idx").on(t.slug) })
);

export const docGroups = pgTable("doc_groups", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id")
    .notNull()
    .references(() => docSections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => docGroups.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  filePath: text("file_path").notNull().default(""),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  fileSize: integer("file_size").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

/** Versões anteriores de um documento (guardadas ao trocar o arquivo) */
export const documentVersions = pgTable("document_versions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  fileSize: integer("file_size").notNull().default(0),
  replacedBy: text("replaced_by").notNull().default(""), // quem trocou o arquivo
  createdAt: createdAt(), // quando deixou de ser a versão atual
});

/** Mensagens recebidas pelo site: fale conosco e ouvidoria (nunca são apagadas, só arquivadas) */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  protocol: text("protocol").notNull().default(""),
  kind: text("kind").notNull().default("contato"), // contato | ouvidoria
  category: text("category").notNull().default(""), // assunto ou tipo de manifestação
  name: text("name").notNull().default(""),
  document: text("document").notNull().default(""), // CPF ou matrícula (opcional)
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  body: text("body").notNull(),
  anonymous: boolean("anonymous").notNull().default(false),
  status: text("status").notNull().default("nova"), // nova | em_andamento | respondida | arquivada
  internalNote: text("internal_note").notNull().default(""),
  // Triagem: quem da equipe está cuidando (sem FK: o histórico permanece se o usuário mudar)
  assignedTo: integer("assigned_to"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Registro de auditoria: quem fez o quê no painel e quando (somente inclusão, nunca editado) */
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // sem FK: o registro permanece mesmo se o usuário mudar
  userName: text("user_name").notNull().default(""),
  action: text("action").notNull(),
  target: text("target").notNull().default(""),
  ip: text("ip").notNull().default(""),
  createdAt: createdAt(),
});

export type User = typeof users.$inferSelect;
export type Slide = typeof slides.$inferSelect;
export type News = typeof news.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type DocSection = typeof docSections.$inferSelect;
export type DocGroup = typeof docGroups.$inferSelect;
export type DocumentRow = typeof documents.$inferSelect;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type AuditEntry = typeof auditLog.$inferSelect;
