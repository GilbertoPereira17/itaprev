import "server-only";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

/**
 * Conexão com o banco.
 * - Produção (servidor da prefeitura): DATABASE_URL=postgres://usuario:senha@host:5432/itaprev
 * - Desenvolvimento: sem DATABASE_URL → PGlite (Postgres embutido em ./.data/pglite)
 *
 * A conexão é criada só na PRIMEIRA consulta (lazy). Isso evita que o `next build`,
 * que carrega os módulos em vários processos paralelos, abra o banco ao mesmo tempo
 * (o PGlite não suporta mais de um processo e corromperia os dados locais).
 */
type DB = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __itaprevDb?: DB };

function createDb(): DB {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("postgres")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg") as typeof import("pg");
    return drizzlePg(new Pool({ connectionString: url, max: 10 }), { schema });
  }
  // Em produção, sem DATABASE_URL o conteúdo iria para um banco em arquivo local e
  // "sumiria" quando a URL fosse corrigida. Falha alto em vez de gravar no lugar errado.
  // (ALLOW_PGLITE=1 libera só para testar o build de produção localmente.)
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PGLITE !== "1") {
    throw new Error("DATABASE_URL ausente ou inválida em produção. Configure o .env (veja DEPLOY.md).");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR || "./.data/pglite";
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require("node:fs") as typeof import("node:fs")).mkdirSync(dir, { recursive: true });
  return drizzlePglite(new PGlite(dir), { schema }) as unknown as DB;
}

function getDb(): DB {
  if (!globalForDb.__itaprevDb) globalForDb.__itaprevDb = createDb();
  return globalForDb.__itaprevDb;
}

export const db: DB = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
