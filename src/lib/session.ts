/** Assinatura/verificação do token de sessão (compatível com o middleware edge). */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "itaprev_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

/** mc = precisa trocar a senha (expirada ou definida por um administrador) */
export type SessionPayload = { uid: number; name: string; role: "admin" | "editor"; mc?: boolean };

/** Cookie temporário entre a senha e o código do 2FA (não dá acesso ao painel) */
export const PENDING_COOKIE = "itaprev_2fa";
export const PENDING_MAX_AGE = 60 * 5; // 5 minutos para digitar o código
export type PendingPayload = { uid: number; next: string; mc: boolean };

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres). Veja .env.example");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.purpose) return null; // token temporário do 2FA não vale como sessão
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function signPending(payload: PendingPayload) {
  return new SignJWT({ ...payload, purpose: "2fa" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifyPending(token: string | undefined): Promise<PendingPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.purpose === "2fa" ? (payload as unknown as PendingPayload) : null;
  } catch {
    return null;
  }
}
