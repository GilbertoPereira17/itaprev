import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ALLOWED, UploadError } from "./storage";
import { decryptBuffer, encryptBuffer } from "./data-crypto";

/**
 * Arquivos pessoais (documentos dos beneficiários): ficam CRIPTOGRAFADOS numa pasta que
 * NÃO é servida pelo Nginx. Só saem pelas rotas que conferem quem está pedindo.
 */
export function privateRoot() {
  return path.resolve(process.env.PRIVATE_UPLOAD_DIR || "./privado");
}

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB por documento
export const PRIVATE_EXTS = ["pdf", "jpg", "jpeg", "png", "webp"];

export async function savePrivate(file: File, folder: string) {
  if (!file || file.size === 0) throw new UploadError("Nenhum arquivo enviado.");
  if (file.size > MAX_BYTES) throw new UploadError("Arquivo maior que 10 MB.");
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const rule = ALLOWED[ext];
  if (!rule || !PRIVATE_EXTS.includes(ext)) throw new UploadError("Envie PDF ou foto (JPG, PNG ou WEBP).");
  const buf = Buffer.from(await file.arrayBuffer());
  if (!rule.magic?.some((sig) => sig.every((b, i) => buf[i] === b))) {
    throw new UploadError("O conteúdo do arquivo não corresponde à extensão.");
  }
  const dir = path.join(privateRoot(), folder.replace(/[^a-z0-9-]/gi, ""));
  await fs.mkdir(dir, { recursive: true });
  const name = `${crypto.randomBytes(12).toString("hex")}.bin`;
  await fs.writeFile(path.join(dir, name), encryptBuffer(buf, "arquivo"));
  return { path: path.relative(privateRoot(), path.join(dir, name)), size: file.size, mime: rule.mime };
}

function resolvePrivate(relPath: string) {
  const full = path.resolve(privateRoot(), relPath);
  if (!full.startsWith(privateRoot() + path.sep)) throw new Error("caminho inválido");
  return full;
}

export async function readPrivate(relPath: string) {
  return decryptBuffer(await fs.readFile(resolvePrivate(relPath)), "arquivo");
}

export async function deletePrivate(relPath: string) {
  await fs.rm(resolvePrivate(relPath), { force: true });
}
