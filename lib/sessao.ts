import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { AppError } from "@/errors/AppError";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";

export type Solicitante = { id: number; perfil: string };

const COOKIE = "sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET não definido no .env");
}
const segredo = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function criarSessao(usuarioId: number, perfil: string) {
  const token = await new SignJWT({ perfil })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuarioId))
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEGUNDOS}s`)
    .sign(segredo);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true, // JavaScript do navegador não lê o cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Quem está fazendo a requisição? Lança 401 se não houver sessão válida
export async function obterSessao(): Promise<Solicitante> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) throw new AppError("Não autenticado.", 401);

  let usuarioId: number;
  try {
    const { payload } = await jwtVerify(token, segredo);
    usuarioId = Number(payload.sub);
  } catch {
    throw new AppError("Sessão inválida ou expirada.", 401);
  }

  // Confere no banco: usuário desativado perde o acesso imediatamente
  const usuario = await UsuarioRepository.buscarPorId(usuarioId);
  if (!usuario || !usuario.ativo) {
    throw new AppError("Não autenticado.", 401);
  }

  return { id: usuario.id, perfil: usuario.perfil };
}

export function exigirAdmin(solicitante: Solicitante) {
  if (solicitante.perfil !== "ADMIN") {
    throw new AppError("Sem permissão.", 403);
  }
}
