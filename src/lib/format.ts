/** Utilitários de formatação compartilhados entre site e painel */

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

/**
 * URL pública de um arquivo:
 * - arquivos do painel são gravados como "uploads/…" e servidos em /uploads/…
 * - caminhos /images/… (arquivos do projeto) e URLs externas passam direto
 */
export function mediaUrl(path: string | null | undefined) {
  if (!path) return "";
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  return `/${path}`;
}

export function formatBytes(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
