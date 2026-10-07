/** CPF: validação, formatação e máscara (sem dependências; serve no cliente e no servidor) */

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** Confere os dígitos verificadores */
export function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function formatCpf(value: string) {
  const c = onlyDigits(value).padStart(11, "0");
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

/** Exibição parcial (padrão do governo): ***.456.789-** */
export function maskCpf(value: string) {
  const f = formatCpf(value);
  return `***.${f.slice(4, 11)}-**`;
}

/** Aceita DD/MM/AAAA ou AAAA-MM-DD e devolve AAAA-MM-DD (ou "" se inválida) */
export function normalizeDate(value: string) {
  const v = value.trim();
  let y: string, m: string, d: string;
  const br = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (br) [, d, m, y] = br;
  else if (iso) [, y, m, d] = iso;
  else return "";
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (date.getUTCFullYear() !== Number(y) || date.getUTCMonth() !== Number(m) - 1 || date.getUTCDate() !== Number(d)) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** AAAA-MM-DD → DD/MM/AAAA */
export const formatDateBr = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");
