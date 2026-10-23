import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const segredo = new TextEncoder().encode(process.env.SESSION_SECRET ?? "");

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sessao")?.value;

  let perfil: string | null = null;
  if (token && segredo.length > 0) {
    try {
      const { payload } = await jwtVerify(token, segredo);
      perfil = typeof payload.perfil === "string" ? payload.perfil : null;
    } catch {
      perfil = null; // token inválido ou expirado
    }
  }

  if (!perfil) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const emAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const emMorador = pathname === "/morador" || pathname.startsWith("/morador/");

  if (emAdmin && perfil !== "ADMIN") {
    return NextResponse.redirect(new URL("/morador", req.url));
  }
  if (emMorador && perfil === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

// Só as áreas restritas. /login, /definir-senha e /api ficam de fora.
export const config = {
  matcher: ["/admin/:path*", "/morador/:path*"],
};