import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { logBenef, requireBeneficiary } from "@/lib/beneficiary";
import { readPrivate } from "@/lib/private-storage";

/** Entrega um documento do próprio beneficiário (descriptografado na hora) */
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const b = await requireBeneficiary();
  const id = parseInt((await props.params).id, 10);
  const [d] = Number.isFinite(id)
    ? await db
        .select()
        .from(schema.beneficiaryDocuments)
        .where(and(eq(schema.beneficiaryDocuments.id, id), eq(schema.beneficiaryDocuments.beneficiaryId, b.id)))
    : [];
  if (!d) return new Response("Não encontrado", { status: 404 });
  try {
    const data = await readPrivate(d.filePath);
    await logBenef(b.id, `Abriu o documento: ${d.docType}`);
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
