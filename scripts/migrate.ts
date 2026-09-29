import "./load-env";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { sql } from "drizzle-orm";
import { openDb } from "./db";

/**
 * Aplica as migrações do banco com duas proteções para o conteúdo em produção:
 *
 * 1. BACKUP AUTOMÁTICO — se houver migração pendente e o banco for PostgreSQL, roda
 *    `pg_dump` antes de aplicar (pasta BACKUP_DIR, padrão ./backups). Se o backup
 *    falhar, a migração NÃO é aplicada.
 * 2. BLOQUEIO DE MIGRAÇÃO DESTRUTIVA — se uma migração pendente contiver comandos que
 *    apagam ou transformam dados (DROP TABLE/COLUMN, TRUNCATE, DELETE, RENAME, troca de
 *    tipo de coluna), o processo para. Só roda com ALLOW_DESTRUCTIVE_MIGRATION=1, depois
 *    de revisar o SQL e confirmar que existe backup.
 */

const MIGRATIONS_DIR = "./drizzle";

const DESTRUCTIVE: { re: RegExp; label: string }[] = [
  { re: /\bDROP\s+TABLE\b/i, label: "DROP TABLE (apaga tabela)" },
  { re: /\bDROP\s+COLUMN\b/i, label: "DROP COLUMN (apaga coluna)" },
  { re: /\bDROP\s+SCHEMA\b/i, label: "DROP SCHEMA" },
  { re: /\bTRUNCATE\b/i, label: "TRUNCATE (esvazia tabela)" },
  { re: /\bDELETE\s+FROM\b/i, label: "DELETE FROM (apaga linhas)" },
  { re: /\bRENAME\b/i, label: "RENAME (renomeia tabela/coluna)" },
  { re: /\bSET\s+DATA\s+TYPE\b|\bALTER\s+COLUMN\s+\S+\s+TYPE\b/i, label: "troca de tipo de coluna" },
];

type JournalEntry = { idx: number; when: number; tag: string };

function readJournal(): JournalEntry[] {
  const file = path.join(MIGRATIONS_DIR, "meta", "_journal.json");
  return JSON.parse(fs.readFileSync(file, "utf8")).entries as JournalEntry[];
}

/** Data (ms) da última migração já aplicada, ou 0 se o banco ainda está vazio. */
async function lastAppliedAt(db: Awaited<ReturnType<typeof openDb>>["db"]): Promise<number> {
  try {
    const res = (await db.execute(
      sql`select created_at from drizzle.__drizzle_migrations order by created_at desc limit 1`
    )) as unknown as { rows: { created_at: string | number }[] };
    return res.rows.length ? Number(res.rows[0].created_at) : 0;
  } catch {
    return 0; // tabela de controle ainda não existe → nenhuma migração aplicada
  }
}

function destructiveFindings(entries: JournalEntry[]) {
  const findings: string[] = [];
  for (const e of entries) {
    const raw = fs.readFileSync(path.join(MIGRATIONS_DIR, `${e.tag}.sql`), "utf8");
    const code = raw.replace(/--.*$/gm, ""); // ignora comentários (inclui "--> statement-breakpoint")
    for (const d of DESTRUCTIVE) if (d.re.test(code)) findings.push(`${e.tag}.sql → ${d.label}`);
  }
  return findings;
}

function backupPostgres(url: string, reason: string) {
  const dir = path.resolve(process.env.BACKUP_DIR || "./backups");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(dir, `itaprev-${reason}-${stamp}.dump`);
  const r = spawnSync("pg_dump", ["--format=custom", `--file=${file}`, url], { stdio: "inherit" });
  if (r.status !== 0) {
    throw new Error(
      "Backup (pg_dump) falhou — migração NÃO aplicada para proteger os dados. " +
        "Confira se o pg_dump está instalado e se a DATABASE_URL está correta."
    );
  }
  console.log(`✔ Backup do banco salvo em ${file}`);
}

async function main() {
  const { db, migrate, close } = await openDb();
  try {
    const since = await lastAppliedAt(db);
    const pending = readJournal().filter((e) => e.when > since);

    if (pending.length === 0) {
      console.log("✔ Banco já está atualizado (nenhuma migração pendente).");
      return;
    }
    console.log(`• ${pending.length} migração(ões) pendente(s): ${pending.map((e) => e.tag).join(", ")}`);

    const findings = destructiveFindings(pending);
    if (findings.length && process.env.ALLOW_DESTRUCTIVE_MIGRATION !== "1") {
      console.error("\n✖ MIGRAÇÃO BLOQUEADA — contém comandos que podem apagar ou alterar dados:");
      findings.forEach((f) => console.error("   - " + f));
      console.error(
        "\nNada foi alterado. Revise o SQL com o desenvolvedor. Se for intencional e houver backup,\n" +
          "rode novamente com ALLOW_DESTRUCTIVE_MIGRATION=1 npm run db:migrate\n"
      );
      process.exitCode = 1;
      return;
    }

    const url = process.env.DATABASE_URL;
    const hasData = since > 0; // banco novo (vazio) não precisa de backup
    if (url && url.startsWith("postgres") && hasData) backupPostgres(url, "pre-migracao");

    await migrate();
    console.log("✔ Banco atualizado (migrações aplicadas).");
  } finally {
    await close();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
