import "server-only";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { isValidCpf, normalizeDate, onlyDigits } from "./cpf";
import { cpfHash, encryptText } from "./data-crypto";

/**
 * Importa a planilha de beneficiários do Instituto (CSV salvo pelo Excel).
 * Colunas reconhecidas (cabeçalho, sem diferença de acento/maiúscula):
 *   cpf · nome · nascimento · matricula · vinculo · beneficio · inicio_beneficio · email · telefone · endereco
 * CPF já existente: atualiza os dados da planilha (nunca mexe na senha).
 */
const COLUMNS: Record<string, string[]> = {
  cpf: ["cpf"],
  name: ["nome", "nome completo"],
  birthDate: ["nascimento", "data nascimento", "data de nascimento", "data_nascimento", "dt nascimento"],
  registration: ["matricula", "matrícula", "numero beneficio", "nº beneficio", "n beneficio", "beneficio numero"],
  kind: ["vinculo", "vínculo", "tipo"],
  benefit: ["beneficio", "benefício", "tipo de beneficio", "tipo beneficio"],
  benefitStart: ["inicio beneficio", "inicio_beneficio", "início do benefício", "data inicio", "inicio"],
  email: ["email", "e-mail"],
  phone: ["telefone", "celular", "fone"],
  address: ["endereco", "endereço"],
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[_\s]+/g, " ").trim();

function decode(buf: Buffer) {
  const utf8 = new TextDecoder("utf-8").decode(buf);
  // Excel no Windows costuma salvar em ANSI (Windows-1252)
  return utf8.includes("�") ? new TextDecoder("windows-1252").decode(buf) : utf8.replace(/^﻿/, "");
}

/** Divide uma linha CSV respeitando aspas */
function splitLine(line: string, sep: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted;
    } else if (ch === sep && !quoted) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function kindOf(v: string) {
  const k = norm(v);
  if (k.startsWith("apos")) return "aposentado";
  if (k.startsWith("pens")) return "pensionista";
  if (k.startsWith("ativ") || k.startsWith("serv")) return "ativo";
  return "";
}

export type ImportResult = { created: number; updated: number; errors: string[] };

export async function importBeneficiaries(buf: Buffer): Promise<ImportResult> {
  const lines = decode(buf).split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { created: 0, updated: 0, errors: ["A planilha está vazia."] };
  const sep = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const header = splitLine(lines[0], sep).map(norm);
  const idx: Record<string, number> = {};
  for (const [field, names] of Object.entries(COLUMNS)) {
    idx[field] = header.findIndex((h) => names.map(norm).includes(h));
  }
  const missing = ["cpf", "name", "birthDate", "registration"].filter((f) => idx[f] < 0);
  if (missing.length) {
    return { created: 0, updated: 0, errors: [`Faltam colunas obrigatórias: ${missing.map((f) => COLUMNS[f][0]).join(", ")}.`] };
  }

  const result: ImportResult = { created: 0, updated: 0, errors: [] };
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], sep);
    const get = (f: string) => (idx[f] >= 0 ? cells[idx[f]] ?? "" : "");
    const cpf = onlyDigits(get("cpf")).padStart(11, "0");
    const name = get("name").replace(/\s+/g, " ");
    const birthDate = normalizeDate(get("birthDate"));
    const registration = onlyDigits(get("registration"));
    const line = `Linha ${i + 1}`;
    if (!isValidCpf(cpf)) { result.errors.push(`${line}: CPF inválido.`); continue; }
    if (!name) { result.errors.push(`${line}: nome vazio.`); continue; }
    if (!birthDate) { result.errors.push(`${line}: data de nascimento inválida.`); continue; }
    if (!registration) { result.errors.push(`${line}: matrícula/nº do benefício vazio.`); continue; }

    const values = {
      name,
      birthDate,
      registration,
      kind: kindOf(get("kind")),
      benefit: get("benefit").slice(0, 120),
      benefitStart: normalizeDate(get("benefitStart")),
      updatedAt: new Date(),
    };
    const contact = {
      ...(get("email") && { email: get("email").toLowerCase() }),
      ...(get("phone") && { phone: get("phone") }),
      ...(get("address") && { address: get("address") }),
    };
    const hash = cpfHash(cpf);
    const [existing] = await db.select({ id: schema.beneficiaries.id, status: schema.beneficiaries.status })
      .from(schema.beneficiaries).where(eq(schema.beneficiaries.cpfHash, hash));
    if (existing) {
      // Pedido de cadastro feito pelo site e confirmado pela planilha: libera o acesso
      await db.update(schema.beneficiaries)
        .set({ ...values, ...(existing.status === "pendente" && { status: "ativo" }) })
        .where(eq(schema.beneficiaries.id, existing.id));
      result.updated++;
    } else {
      await db.insert(schema.beneficiaries).values({ ...values, ...contact, cpfHash: hash, cpfEnc: encryptText(cpf), origin: "planilha" });
      result.created++;
    }
  }
  return result;
}
