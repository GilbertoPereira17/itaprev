import type { MetadataRoute } from "next";

const BASE = (process.env.SITE_URL || "https://www.itanhaemprev.sp.gov.br").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/busca"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
