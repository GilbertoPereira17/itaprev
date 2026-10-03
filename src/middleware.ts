import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Protege todo o /admin (exceto as telas de login e do código 2FA) */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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

export const config = { matcher: ["/admin/:path*"] };
