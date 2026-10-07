import type { MetadataRoute } from "next";

const BASE = (process.env.SITE_URL || "https://www.itanhaemprev.sp.gov.br").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  // Homologação: nenhum buscador deve indexar
  if (process.env.HOMOLOGACAO === "1") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/busca", "/beneficiario"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
