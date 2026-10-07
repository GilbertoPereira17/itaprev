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

// ---- Área do Beneficiário (sessão separada da equipe) ----
// O token leva purpose "benef": verifySession (painel) o recusa, e vice-versa.
export const BENEF_COOKIE = "itaprev_benef";
export const BENEF_MAX_AGE = 60 * 60 * 2; // 2 horas
export const BENEF_PENDING_COOKIE = "itaprev_benef_2fa";
export type BenefPayload = { bid: number; name: string; iat?: number };

async function signPurpose(payload: Record<string, unknown>, purpose: string, maxAge: number) {
  return new SignJWT({ ...payload, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretKey());
}

async function verifyPurpose<T>(token: string | undefined, purpose: string): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.purpose === purpose ? (payload as unknown as T) : null;
  } catch {
    return null;
  }
}

export const signBenef = (p: BenefPayload) => signPurpose(p, "benef", BENEF_MAX_AGE);
export const verifyBenef = (t: string | undefined) => verifyPurpose<BenefPayload>(t, "benef");
export const signBenefPending = (p: { bid: number }) => signPurpose(p, "benef-2fa", PENDING_MAX_AGE);
export const verifyBenefPending = (t: string | undefined) => verifyPurpose<{ bid: number }>(t, "benef-2fa");
