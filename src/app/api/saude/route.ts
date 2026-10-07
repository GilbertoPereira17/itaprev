import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

/** Verificação de disponibilidade para monitoramento: site + banco. Não expõe detalhes. */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ status: "ok", banco: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[saude] banco indisponível:", e);
    return NextResponse.json({ status: "erro", banco: "indisponível" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
