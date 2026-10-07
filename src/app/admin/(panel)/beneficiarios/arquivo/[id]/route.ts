import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { canAccess, parseModules } from "@/lib/permissions";
import { readPrivate } from "@/lib/private-storage";

/** Documento de beneficiário para a equipe (módulo Beneficiários ou Mensagens) */
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Não autorizado", { status: 401 });
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, session.uid));
  const u = user && user.active ? { role: user.role, modules: parseModules(user.modules) } : null;
  if (!u || !(canAccess(u, "beneficiarios") || canAccess(u, "mensagens"))) return new Response("Sem acesso", { status: 403 });

  const id = parseInt((await props.params).id, 10);
  const [d] = Number.isFinite(id) ? await db.select().from(schema.beneficiaryDocuments).where(eq(schema.beneficiaryDocuments.id, id)) : [];
  if (!d) return new Response("Não encontrado", { status: 404 });
  const data = await readPrivate(d.filePath);
  await audit({ uid: user.id, name: user.name }, "Abriu documento de beneficiário", `${d.docType} v${d.version} (beneficiário nº ${d.beneficiaryId})`);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": d.mimeType,
      "Content-Disposition": `inline; filename="documento-${d.id}.${d.mimeType === "application/pdf" ? "pdf" : d.mimeType.split("/")[1]}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
