import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccessibilityWidget } from "@/components/accessibility/AccessibilityWidget";
import { ChatWidget } from "@/components/chatbot/ChatWidget";
import { getNavSections, getSettings } from "@/lib/content";

/** Layout do site público (o painel /admin tem layout próprio) */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navSections] = await Promise.all([getSettings(), getNavSections()]);

  return (
    <>
      <Header navSections={navSections} settings={settings} />
      <main id="conteudo-principal" className="flex-1">
        {children}
      </main>
      <AccessibilityWidget />
      <ChatWidget />
      <Footer settings={settings} />
    </>
  );
}
