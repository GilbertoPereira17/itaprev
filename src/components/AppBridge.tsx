"use client";

import { useEffect } from "react";

/**
 * Ajustes quando o site roda DENTRO do aplicativo (Capacitor). No navegador comum não faz nada.
 * - PDFs/planilhas e sites de outros órgãos abrem no visualizador do celular (o WebView não exibe PDF);
 * - documentos do beneficiário abrem por um link temporário (2 min);
 * - botão "voltar" do Android volta a página (ou fecha o app na primeira tela).
 */
type CapPlugins = {
  Browser?: { open: (o: { url: string }) => Promise<void> };
  App?: { addListener: (e: string, cb: (d: { canGoBack: boolean }) => void) => void; exitApp: () => void };
};
type Cap = { isNativePlatform?: () => boolean; Plugins?: CapPlugins };

const FILE_RE = /\.(pdf|docx?|xlsx?)$/i;

export function AppBridge() {
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: Cap }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    const { Browser, App } = cap.Plugins ?? {};

    const onClick = async (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || !a.href || !Browser || e.defaultPrevented) return;
      const url = new URL(a.href, location.href);
      if (!/^https?:$/.test(url.protocol)) return; // tel:, mailto: seguem o padrão
      const external = url.hostname !== location.hostname;
      const privateDoc = /^\/beneficiario\/arquivo\/\d+$/.test(url.pathname);
      if (!external && !privateDoc && !FILE_RE.test(url.pathname)) return;
      e.preventDefault();
      if (privateDoc) {
        const res = await fetch(`${url.pathname}?link=1`, { credentials: "same-origin" });
        if (!res.ok) return;
        const { url: link } = await res.json();
        await Browser.open({ url: new URL(link, location.origin).href });
      } else {
        await Browser.open({ url: url.href });
      }
    };
    document.addEventListener("click", onClick, true);
    App?.addListener("backButton", ({ canGoBack }) => (canGoBack ? history.back() : App.exitApp()));
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
