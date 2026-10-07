import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { logBenef, requireBeneficiary } from "@/lib/beneficiary";
import { readPrivate } from "@/lib/private-storage";
import { signDocLink, verifyDocLink } from "@/lib/session";

/**
 * Entrega um documento do próprio beneficiário (descriptografado na hora).
 * ?link=1 → devolve um link temporário (2 min) para abrir fora da sessão (visualizador do celular, no app).
 * ?t=...  → entrega pelo link temporário.
 */
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const url = new URL(req.url);
  const id = parseInt((await props.params).id, 10);
  if (!Number.isFinite(id)) return new Response("Não encontrado", { status: 404 });

  let beneficiaryId: number;
  const token = url.searchParams.get("t");
  if (token) {
    const link = await verifyDocLink(token);
    if (!link || link.did !== id) return new Response("Link expirado. Abra o documento de novo pelo app.", { status: 403 });
    beneficiaryId = link.bid;
  } else {
    beneficiaryId = (await requireBeneficiary()).id;
  }

  const [d] = await db
    .select()
    .from(schema.beneficiaryDocuments)
    .where(and(eq(schema.beneficiaryDocuments.id, id), eq(schema.beneficiaryDocuments.beneficiaryId, beneficiaryId)));
  if (!d) return new Response("Não encontrado", { status: 404 });

  if (url.searchParams.get("link") === "1") {
    const t = await signDocLink({ did: d.id, bid: beneficiaryId });
    return Response.json({ url: `${url.pathname}?t=${t}` }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const data = await readPrivate(d.filePath);
    await logBenef(beneficiaryId, `Abriu o documento: ${d.docType}`);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": d.mimeType,
        "Content-Disposition": `inline; filename="documento-${d.id}.${d.mimeType === "application/pdf" ? "pdf" : d.mimeType.split("/")[1]}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("[beneficiário] falha ao ler documento", d.id, e);
    return new Response("Arquivo indisponível", { status: 500 });
  }
}
