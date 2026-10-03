import "./load-env";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { openDb, schema } from "./db";
import { INSTITUTION_INFO } from "../src/data/institution";
import { NEWS_DATA } from "../src/data/news";
import { FAQ_DATA } from "../src/data/faq";

/**
 * Seed inicial (idempotente):
 * - garante o usuário administrador (ADMIN_EMAIL / ADMIN_PASSWORD no .env)
 * - popula configurações, slides, notícias e FAQ apenas se as tabelas estiverem vazias
 */
async function main() {
  const { db, close } = await openDb();

  // ---- Administrador ----
  const email = (process.env.ADMIN_EMAIL || "admin@itanhaemprev.sp.gov.br").toLowerCase();
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing.length === 0) {
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");
    await db.insert(schema.users).values({
      name: "Administrador",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
      mustChangePassword: true, // no primeiro acesso a pessoa define a própria senha
    });
    console.log(`✔ Admin criado: ${email}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`  Senha gerada (anote e troque no primeiro acesso): ${password}`);
    }
  } else {
    console.log(`• Admin já existe: ${email}`);
  }

  // ---- Configurações ----
  if ((await db.select().from(schema.settings)).length === 0) {
    const c = INSTITUTION_INFO.contacts;
    const l = INSTITUTION_INFO.externalLinks;
    const entries: Record<string, string> = {
      "contato.telefone": c.phone,
      "contato.whatsapp": c.whatsapp,
      "contato.whatsappUrl": c.whatsappUrl,
      "contato.email": c.email,
      "contato.ouvidoriaEmail": c.ouvidoriaEmail,
      "contato.horario": c.hours,
      "contato.endereco": INSTITUTION_INFO.address.full,
      "contato.mapsUrl": INSTITUTION_INFO.address.googleMapsUrl,
      "link.holerite": l.holeriteSystem,
      "link.portalSegurado": l.protecWeb,
      "link.censoManual": l.censoManual,
      "link.transparencia": l.transparencyPortal,
      "link.ouvidoriaForm": l.ouvidoriaForm,
      "link.tce": l.tcesp,
      "link.prefeitura": l.prefeitura,
      "link.camara": l.camara,
    };
    await db.insert(schema.settings).values(Object.entries(entries).map(([key, value]) => ({ key, value })));
    console.log("✔ Configurações iniciais");
  }

  // ---- Slides ----
  if ((await db.select().from(schema.slides)).length === 0) {
    await db.insert(schema.slides).values([
      {
        tag: "Atendimento ao segurado",
        title: "Seus serviços previdenciários em um só lugar",
        description:
          "Holerite, informe de rendimentos, recadastramento e orientações — com atendimento humano sempre que você precisar.",
        buttonLabel: "Ver serviços",
        buttonUrl: "#servicos",
        imagePath: "/images/hero-cover.jpg",
        sortOrder: 0,
      },
      {
        tag: "Recadastramento anual",
        title: "Mantenha seu cadastro em dia",
        description:
          "O recadastramento anual garante a regularidade do seu benefício. Veja o passo a passo e faça pela internet, sem sair de casa.",
        buttonLabel: "Como fazer o recadastramento",
        buttonUrl: INSTITUTION_INFO.externalLinks.censoManual,
        imagePath: "/images/slide-censo.jpg",
        sortOrder: 1,
      },
    ]);
    console.log("✔ Slides iniciais");
  }

  // ---- Notícias ----
  if ((await db.select().from(schema.news)).length === 0) {
    await db.insert(schema.news).values(
      NEWS_DATA.map((n) => {
        const [d, m, y] = n.date.split("/").map(Number);
        return {
          title: n.title,
          slug: n.slug,
          category: n.category,
          summary: n.summary,
          content: `<p>${n.summary}</p>`,
          publishedAt: new Date(y, m - 1, d, 12),
        };
      })
    );
    console.log("✔ Notícias iniciais");
  }

  // ---- FAQ ----
  if ((await db.select().from(schema.faqs)).length === 0) {
    await db.insert(schema.faqs).values(
      FAQ_DATA.map((f, i) => ({ question: f.question, answer: f.answer, sortOrder: i }))
    );
    console.log("✔ FAQ inicial");
  }

  await close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
