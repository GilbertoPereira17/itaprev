import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
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
      <body className="min-h-screen flex flex-col antialiased bg-white relative font-sans text-slate-900">{children}</body>
    </html>
  );
}
