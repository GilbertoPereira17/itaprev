// Cabeçalhos de segurança (OWASP). O VLibras (gov.br) usa Unity/WebAssembly: precisa de
// 'unsafe-eval', blob: e dos domínios vlibras.gov.br. Em desenvolvimento o Next também usa eval.
// (o vlibras.gov.br redireciona os arquivos para o CDN jsDelivr)
const VLIBRAS = "https://vlibras.gov.br https://*.vlibras.gov.br https://cdn.jsdelivr.net";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: ${VLIBRAS}`,
  `style-src 'self' 'unsafe-inline' ${VLIBRAS}`,
  "img-src 'self' data: blob: https:",
  `font-src 'self' data: ${VLIBRAS}`,
  `connect-src 'self' blob: data: ${VLIBRAS}`,
  `media-src 'self' blob: ${VLIBRAS}`,
  "worker-src 'self' blob:",
  `frame-src 'self' ${VLIBRAS}`,
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()" },
  // HSTS só tem efeito em HTTPS (o navegador ignora em HTTP)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Imagens enviadas pelo painel são servidas por /uploads (rota própria)
    unoptimized: true,
  },
  // Drivers de banco rodam só no servidor, sem passar pelo bundler
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  experimental: {
    serverActions: { bodySizeLimit: "30mb" }, // upload de PDFs pelo painel
  },
};

export default nextConfig;
