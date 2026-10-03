/** Política de senhas do painel */

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX_AGE_DAYS = 180; // troca obrigatória a cada 6 meses

const COMMON = ["1234567890", "0123456789", "senha12345", "itanhaemprev", "itaprev123", "password123", "qwertyuiop", "admin12345"];

export const PASSWORD_RULES = `Mínimo de ${PASSWORD_MIN} caracteres, com letras e números.`;

/** Retorna a mensagem de erro, ou null se a senha atende à política */
export function passwordProblem(password: string, email = ""): string | null {
  if (password.length < PASSWORD_MIN) return `A senha precisa ter ao menos ${PASSWORD_MIN} caracteres.`;
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) return "A senha precisa ter letras e números.";
  const lower = password.toLowerCase();
  if (COMMON.some((c) => lower.includes(c))) return "Essa senha é muito comum. Escolha outra.";
  const user = email.split("@")[0]?.toLowerCase();
  if (user && user.length >= 4 && lower.includes(user)) return "A senha não pode conter o seu e-mail.";
  return null;
}

/** A senha passou do prazo de validade? */
export function passwordExpired(changedAt: Date | string) {
  return Date.now() - new Date(changedAt).getTime() > PASSWORD_MAX_AGE_DAYS * 86_400_000;
}
