import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { AppBridge } from "@/components/AppBridge";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

/** HOMOLOGACAO=1 no .env: cópia de testes — faixa de aviso e fora do Google */
const HOMOLOGACAO = process.env.HOMOLOGACAO === "1";

export const metadata: Metadata = {
  ...(HOMOLOGACAO && { robots: { index: false, follow: false } }),
  metadataBase: new URL(process.env.SITE_URL || "https://www.itanhaemprev.sp.gov.br"),
  title: {
    default: "Itanhaém Prev - Instituto de Previdência de Itanhaém",
    template: "%s | Itanhaém Prev",
  },
  description:
    "Portal Oficial do Itanhaém Prev - Unidade Gestora Única de Previdência Social dos Servidores Públicos do Município de Itanhaém. Acesso a holerites, informes de rendimentos, censo e transparência.",
  keywords: [
    "Itanhaém Prev",
    "Previdência Municipal Itanhaém",
    "RPPS Itanhaém",
    "Holerite Servidor Itanhaém",
    "Aposentados Itanhaém",
    "Pensionistas Itanhaém",
    "Transparência Itanhaém Prev",
  ],
  authors: [{ name: "Trius Tecnologia" }],
  openGraph: {
    title: "Itanhaém Prev - Instituto de Previdência de Itanhaém",
    description: "Portal Oficial de Serviços e Informações Previdenciárias de Itanhaém.",
    siteName: "Itanhaém Prev",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={publicSans.variable}>
      <body className="min-h-screen flex flex-col antialiased bg-white relative font-sans text-slate-900">
        {HOMOLOGACAO && (
          <div role="note" className="bg-amber-400 px-4 py-1.5 text-center text-sm font-bold text-slate-900">
            Ambiente de homologação (testes) — as informações aqui não são oficiais
          </div>
        )}
        {children}
        <AppBridge />
      </body>
    </html>
  );
}
