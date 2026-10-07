import "server-only";
import crypto from "node:crypto";

/**
 * Criptografia de dados pessoais em repouso (LGPD): CPF e documentos dos beneficiários.
 * Chave derivada de DATA_KEY (ou, se ausente, do SESSION_SECRET). NÃO troque essas
 * variáveis depois de ter beneficiários cadastrados: os dados ficariam ilegíveis.
 */
function keyFor(purpose: string) {
  const s = process.env.DATA_KEY || process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("DATA_KEY/SESSION_SECRET ausente ou curto demais.");
  return crypto.createHash("sha256").update(`itaprev-${purpose}:${s}`).digest();
}

/** Hash para localizar um CPF sem guardá-lo em texto (HMAC-SHA256) */
export function cpfHash(cpfDigits: string) {
  return crypto.createHmac("sha256", keyFor("cpf-hash")).update(cpfDigits).digest("hex");
}

export function encryptBuffer(data: Buffer, purpose = "dados") {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyFor(purpose), iv);
  const enc = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]); // [12 iv][16 tag][dados]
}

export function decryptBuffer(blob: Buffer, purpose = "dados") {
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyFor(purpose), blob.subarray(0, 12));
  decipher.setAuthTag(blob.subarray(12, 28));
  return Buffer.concat([decipher.update(blob.subarray(28)), decipher.final()]);
}

export const encryptText = (text: string) => encryptBuffer(Buffer.from(text, "utf8"), "texto").toString("base64url");

export function decryptText(stored: string) {
  try {
    return decryptBuffer(Buffer.from(stored, "base64url"), "texto").toString("utf8");
  } catch {
    return "";
  }
}
