/** Assinatura/verificação do token de sessão (compatível com o middleware edge). */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "itaprev_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

export type SessionPayload = { uid: number; name: string; role: "admin" | "editor" };

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
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
