// Aplicativo do Itanhaém Prev: abre o próprio site (mesmo conteúdo, mesmo login).
// Endereço do site: APP_URL (padrão: endereço oficial). Ex.: APP_URL=https://www2.itanhaemprev.sp.gov.br npm run sync
const url = (process.env.APP_URL || "https://www.itanhaemprev.sp.gov.br").replace(/\/$/, "");
const host = new URL(url).hostname;
// A tela "sem conexão" precisa saber para onde voltar
require("fs").writeFileSync(`${__dirname}/www/app-url.js`, `window.APP_URL = ${JSON.stringify(url)};\n`);

/** @type {import('@capacitor/cli').CapacitorConfig} */
module.exports = {
  appId: "br.gov.sp.itanhaemprev.app",
  appName: "Itanhaém Prev",
  webDir: "www",
  appendUserAgent: "ItanhaemPrevApp",
  backgroundColor: "#ffffff",
  server: {
    url,
    // Só o site do Instituto abre dentro do app; outros endereços abrem no navegador do celular
    allowNavigation: [...new Set([host, "itanhaemprev.sp.gov.br", "www.itanhaemprev.sp.gov.br", "www2.itanhaemprev.sp.gov.br"])],
    // Tela própria quando o celular está sem internet
    errorPath: "offline.html",
  },
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: "#0b1f3a", showSpinner: false, androidScaleType: "CENTER_INSIDE" },
    StatusBar: { style: "DARK", backgroundColor: "#0b1f3a", overlaysWebView: false },
  },
  android: { allowMixedContent: false },
  ios: { contentInset: "automatic" },
};
