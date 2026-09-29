/** Conexão com o banco para scripts de linha de comando (migrate, seed, import). */
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "../src/db/schema";

export async function openDb() {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("postgres")) {
    const pool = new Pool({ connectionString: url });
    const db = drizzlePg(pool, { schema });
    return {
      db,
      migrate: () => migratePg(db, { migrationsFolder: "./drizzle" }),
      close: () => pool.end(),
    };
  }
  const dir = process.env.PGLITE_DIR || "./.data/pglite";
  (await import("node:fs")).mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzlePglite(client, { schema });
  return {
    db: db as unknown as ReturnType<typeof drizzlePg<typeof schema>>,
    migrate: () => migratePglite(db, { migrationsFolder: "./drizzle" }),
    close: () => client.close(),
  };
}

export { schema };
