import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/** Volta para a página com mensagem de sucesso */
export function done(path: string, ok: string): never {
  revalidatePath("/", "layout");
  redirect(`${path}${path.includes("?") ? "&" : "?"}ok=${encodeURIComponent(ok)}`);
}

/** Volta para a página com mensagem de erro */
export function fail(path: string, erro: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}erro=${encodeURIComponent(erro)}`);
}

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
export const bool = (fd: FormData, key: string) => fd.get(key) === "on";
export const int = (fd: FormData, key: string) => {
  const n = parseInt(String(fd.get(key) ?? ""), 10);
  return Number.isFinite(n) ? n : 0;
};
export const file = (fd: FormData, key: string) => {
  const f = fd.get(key);
  return f instanceof File && f.size > 0 ? f : null;
};
