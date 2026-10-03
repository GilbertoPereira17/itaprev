import fs from "node:fs/promises";
import path from "node:path";
import { ALLOWED, uploadRoot } from "@/lib/storage";

/**
 * Serve os arquivos enviados pelo painel em /uploads/…
 * (Em produção o Nginx pode servir a mesma pasta direto — ver DEPLOY.md.)
 */
export async function GET(_req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  const root = uploadRoot();
  const full = path.resolve(root, ...params.path);

  // Bloqueia path traversal (../) e acesso fora da pasta
  if (!full.startsWith(root + path.sep)) return new Response("Não encontrado", { status: 404 });

  const ext = (full.split(".").pop() || "").toLowerCase();
  const rule = ALLOWED[ext];
  if (!rule) return new Response("Não encontrado", { status: 404 });

  try {
    const data = await fs.readFile(full);
    return new Response(data, {
      headers: {
        "Content-Type": rule.mime,
        "Content-Disposition": `inline; filename="${path.basename(full)}"`,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
