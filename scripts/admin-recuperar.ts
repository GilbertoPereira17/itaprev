import "./load-env";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { openDb, schema } from "./db";

/**
 * Recuperação de acesso ao painel (rodar no servidor):
 *   npm run admin:recuperar -- email@itanhaemprev.sp.gov.br
 *
 * Para quando a pessoa perdeu o celular do 2FA ou esqueceu a senha e não há outro
 * administrador para ajudar. Gera uma senha provisória, desliga o 2FA e reativa o usuário.
 */
async function main() {
  const email = (process.argv[2] || "").trim().toLowerCase();
  if (!email) {
    console.error("Uso: npm run admin:recuperar -- email@exemplo.gov.br");
    process.exit(1);
  }
  const { db, close } = await openDb();
  try {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (!user) {
      console.error(`✖ Nenhum usuário com o e-mail ${email}.`);
      process.exitCode = 1;
      return;
    }
    const password = `Itaprev-${crypto.randomBytes(5).toString("hex")}`;
    await db
      .update(schema.users)
      .set({
        passwordHash: await bcrypt.hash(password, 12),
        mustChangePassword: true,
        passwordChangedAt: new Date(),
        totpEnabled: false,
        totpSecret: "",
        active: true,
      })
      .where(eq(schema.users.id, user.id));
    await db.insert(schema.auditLog).values({
      userId: user.id,
      userName: "Servidor (recuperação de acesso)",
      action: "Recuperou acesso: senha provisória e 2FA desativado",
      target: `${user.name} <${user.email}>`,
    });
    console.log(`✔ Acesso de ${user.name} recuperado.`);
    console.log(`  Senha provisória: ${password}`);
    console.log("  No próximo login será pedida uma nova senha. Reative o 2FA em Minha conta.");
  } finally {
    await close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
