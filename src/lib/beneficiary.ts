import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { BENEF_COOKIE, verifyBenef } from "./session";
import { cpfHash } from "./data-crypto";
import { onlyDigits } from "./cpf";

/** Tipos de documento que o beneficiário pode enviar */
export const DOC_TYPES = [
  "Documento de identidade (RG ou CNH)",
  "CPF",
  "Comprovante de residência",
  "Certidão de nascimento ou casamento",
  "Prova de vida / declaração",
  "Laudo ou atestado médico",
  "Outro",
];

/** Assuntos de requerimento (entram na fila de Mensagens e Ouvidoria do painel) */
export const REQUEST_TYPES = [
  "Atualização de dados cadastrais (nome, estado civil, dependentes)",
  "Recadastramento / prova de vida",
  "Certidão de tempo de contribuição (CTC)",
  "Segunda via de documento",
  "Revisão de benefício",
  "Exclusão da minha conta na Área do Beneficiário (LGPD)",
  "Outro assunto",
];

export const BENEF_KIND: Record<string, string> = {
  aposentado: "Aposentado(a)",
  pensionista: "Pensionista",
  ativo: "Servidor(a) ativo(a)",
};

export const DOC_STATUS: Record<string, string> = { enviado: "Em análise", aceito: "Aceito", recusado: "Recusado" };

export async function clientIp() {
  return ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim();
}

/** Registra na trilha do beneficiário (ele mesmo vê em "Segurança") */
export async function logBenef(beneficiaryId: number, action: string, actor = "beneficiário") {
  try {
    await db.insert(schema.beneficiaryLog).values({ beneficiaryId, action: action.slice(0, 300), actor, ip: await clientIp() });
  } catch (e) {
    console.error("[beneficiário] falha ao registrar:", action, e);
  }
}

export async function findByCpf(cpf: string) {
  const [b] = await db.select().from(schema.beneficiaries).where(eq(schema.beneficiaries.cpfHash, cpfHash(onlyDigits(cpf))));
  return b ?? null;
}

/** Beneficiário logado e ativo; senão volta para o login */
export async function requireBeneficiary() {
  const session = await verifyBenef((await cookies()).get(BENEF_COOKIE)?.value);
  if (!session) redirect("/beneficiario/entrar");
  const [b] = await db.select().from(schema.beneficiaries).where(eq(schema.beneficiaries.id, session.bid));
  if (!b || b.status !== "ativo" || !b.passwordHash) redirect("/beneficiario/entrar");
  // Senha trocada depois do login (ex.: em outro aparelho): a sessão antiga deixa de valer
  if (b.passwordChangedAt && (session.iat ?? 0) * 1000 < b.passwordChangedAt.getTime() - 1000) {
    redirect("/beneficiario/entrar?erro=sessao");
  }
  return b;
}
