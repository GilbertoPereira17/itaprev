import "server-only";
import crypto from "node:crypto";

/**
 * Verificação em duas etapas (TOTP, RFC 6238) — o mesmo padrão do Google Authenticator,
 * Microsoft Authenticator etc. Implementado com o crypto do Node, sem serviço externo.
 *
 * O segredo de cada usuário é guardado CRIPTOGRAFADO (AES-256-GCM) com chave derivada do
 * SESSION_SECRET. Se o SESSION_SECRET for trocado, os 2FA ativos deixam de valer e precisam
 * ser reconfigurados (`npm run admin:recuperar -- email` desativa o 2FA de um usuário).
 */

const ISSUER = "Itanhaém Prev";
const STEP_SECONDS = 30;
const DIGITS = 6;
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer) {
  let bits = 0, value = 0, out = "";
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str: string) {
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of str.replace(/=+$/, "").toUpperCase()) {
    const idx = B32.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function codeAt(secret: string, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", base32Decode(secret)).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return String(bin).padStart(DIGITS, "0");
}

/** Novo segredo aleatório (160 bits, em base32) */
export function generateSecret() {
  return base32Encode(crypto.randomBytes(20));
}

/** Confere o código digitado, aceitando 30s de diferença de relógio para cada lado */
export function verifyCode(secret: string, code: string, now = Date.now()) {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== DIGITS || !secret) return false;
  const counter = Math.floor(now / 1000 / STEP_SECONDS);
  return [-1, 0, 1].some((d) =>
    crypto.timingSafeEqual(Buffer.from(codeAt(secret, counter + d)), Buffer.from(clean))
  );
}

/** Endereço lido pelo QR code nos aplicativos autenticadores */
export function otpauthUrl(email: string, secret: string) {
  const label = encodeURIComponent(`${ISSUER}:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(ISSUER)}&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

// ---- Criptografia do segredo em repouso ----
function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET ausente ou curto demais.");
  return crypto.createHash("sha256").update(`itaprev-totp:${s}`).digest();
}

export function encryptSecret(secret: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decryptSecret(stored: string) {
  try {
    const [iv, tag, data] = stored.split(".").map((p) => Buffer.from(p, "base64url"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return ""; // segredo ilegível (ex.: SESSION_SECRET trocado) → 2FA não valida
  }
}
