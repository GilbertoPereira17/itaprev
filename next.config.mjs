/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Imagens enviadas pelo painel são servidas por /uploads (rota própria)
    unoptimized: true,
  },
  experimental: {
    // Drivers de banco rodam só no servidor, sem passar pelo bundler
    serverComponentsExternalPackages: ["@electric-sql/pglite", "pg"],
    serverActions: { bodySizeLimit: "30mb" }, // upload de PDFs pelo painel
  },
};

export default nextConfig;
