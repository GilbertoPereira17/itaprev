import type { MetadataRoute } from "next";

/** Manifesto do aplicativo web: permite "instalar" o site no celular e prepara o app (Capacitor) */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Itanhaém Prev",
    short_name: "Itanhaém Prev",
    description: "Instituto de Previdência dos Servidores Públicos do Município de Itanhaém",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0B1E36",
    lang: "pt-BR",
    icons: [
      { src: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
