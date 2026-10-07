import { NextResponse, type NextRequest } from "next/server";
import { BENEF_COOKIE, SESSION_COOKIE, verifyBenef, verifySession } from "@/lib/session";

/** Telas da Área do Beneficiário abertas sem login */
const BENEF_PUBLIC = ["/beneficiario/entrar", "/beneficiario/entrar/codigo", "/beneficiario/primeiro-acesso", "/beneficiario/cadastro"];

/** Protege o /admin (equipe) e a Área do Beneficiário (/beneficiario), cada um com sua sessão */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/beneficiario")) {
    if (BENEF_PUBLIC.includes(pathname)) return NextResponse.next();
    // Link temporário de documento (?t=...): a rota confere o token
    if (/^\/beneficiario\/arquivo\/\d+$/.test(pathname) && req.nextUrl.searchParams.has("t")) return NextResponse.next();
    const benef = await verifyBenef(req.cookies.get(BENEF_COOKIE)?.value);
    if (!benef) {
      const url = req.nextUrl.clone();
      url.pathname = "/beneficiario/entrar";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname === "/admin/login/2fa") return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  // Senha expirada ou provisória: só libera a tela de troca de senha
  if (session.mc && pathname !== "/admin/conta") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/conta";
    url.search = "?troca=1";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/beneficiario/:path*"] };
