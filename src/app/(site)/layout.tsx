import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccessibilityWidget } from "@/components/accessibility/AccessibilityWidget";
import { ChatWidget } from "@/components/chatbot/ChatWidget";
import { JsonLd } from "@/components/content/JsonLd";
import { getNavSections, getSettings } from "@/lib/content";
import { buildInfo } from "@/lib/site-info";

/** Layout do site público (o painel /admin tem layout próprio) */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navSections] = await Promise.all([getSettings(), getNavSections()]);

  const info = buildInfo(settings);
  const siteUrl = (process.env.SITE_URL || "https://www.itanhaemprev.sp.gov.br").replace(/\/$/, "");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "GovernmentOrganization",
          name: "Instituto de Previdência dos Servidores Públicos do Município de Itanhaém (Itanhaém Prev)",
          alternateName: "Itanhaém Prev",
          url: siteUrl,
          logo: `${siteUrl}/images/Logo.png`,
          telephone: info.contacts.phone,
          email: info.contacts.email,
          address: { "@type": "PostalAddress", streetAddress: info.address.full, addressLocality: "Itanhaém", addressRegion: "SP", addressCountry: "BR" },
        }}
      />
      {/* Atalhos eMAG: aparecem ao navegar por teclado (Tab) e respondem a Alt+1/2/3 */}
      <nav aria-label="Atalhos de acessibilidade">
        <a href="#conteudo-principal" accessKey="1" className="skip-to-content">Ir para o conteúdo [1]</a>
        <a href="#menu-principal" accessKey="2" className="skip-to-content">Ir para o menu [2]</a>
        <a href="#rodape" accessKey="3" className="skip-to-content">Ir para o rodapé [3]</a>
      </nav>
      <Header navSections={navSections} settings={settings} />
      <main id="conteudo-principal" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <AccessibilityWidget />
      <ChatWidget />
      <Footer settings={settings} />
    </>
  );
}
