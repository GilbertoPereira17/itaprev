import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { slugify } from "./format";

/** Pasta raiz dos arquivos enviados (persistente, fora do código). */
export function uploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

/** Tipos aceitos: extensão → MIME + assinatura binária (magic bytes) */
export const ALLOWED: Record<string, { mime: string; magic?: number[][] }> = {
  pdf: { mime: "application/pdf", magic: [[0x25, 0x50, 0x44, 0x46]] }, // %PDF
  jpg: { mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  jpeg: { mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  png: { mime: "image/png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  webp: { mime: "image/webp", magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF
  doc: { mime: "application/msword", magic: [[0xd0, 0xcf, 0x11, 0xe0]] },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", magic: [[0x50, 0x4b]] },
  xls: { mime: "application/vnd.ms-excel", magic: [[0xd0, 0xcf, 0x11, 0xe0]] },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", magic: [[0x50, 0x4b]] },
};

export const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];

export class UploadError extends Error {}

function checkMagic(buf: Buffer, magic?: number[][]) {
  if (!magic) return true;
  return magic.some((sig) => sig.every((b, i) => buf[i] === b));
}

/**
 * Salva um arquivo enviado. Retorna o caminho relativo ("uploads/…") gravado no banco.
 * @param onlyImages restringe a imagens (capas, slides)
 */
export async function saveUpload(file: File, folder: string, onlyImages = false) {
  if (!file || file.size === 0) throw new UploadError("Nenhum arquivo enviado.");
  if (file.size > MAX_BYTES) throw new UploadError("Arquivo maior que 30 MB.");

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const rule = ALLOWED[ext];
  if (!rule || (onlyImages && !IMAGE_EXTS.includes(ext))) {
    throw new UploadError(
      onlyImages ? "Envie uma imagem JPG, PNG ou WEBP." : "Tipo de arquivo não permitido (PDF, imagens, Word ou Excel)."
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (!checkMagic(buf, rule.magic)) throw new UploadError("O conteúdo do arquivo não corresponde à extensão.");

  const safeFolder = slugify(folder) || "geral";
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "arquivo";
  const name = `${base}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(uploadRoot(), safeFolder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);

  return { path: `uploads/${safeFolder}/${name}`, size: file.size, mime: rule.mime };
}

/** Remove um arquivo enviado (ignora caminhos fora da pasta de uploads) */
export async function deleteUpload(relPath: string | null | undefined) {
  if (!relPath || !relPath.startsWith("uploads/")) return;
  const full = path.resolve(uploadRoot(), relPath.slice("uploads/".length));
  if (!full.startsWith(uploadRoot() + path.sep)) return;
  await fs.rm(full, { force: true });
}
