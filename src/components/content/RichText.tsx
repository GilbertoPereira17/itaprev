import { cleanHtml } from "@/lib/sanitize";

/** Renderiza HTML do painel/WordPress já sanitizado, com tipografia legível para idosos */
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`prose-itaprev ${className}`} dangerouslySetInnerHTML={{ __html: cleanHtml(html) }} />;
}
