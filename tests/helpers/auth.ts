import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { criarSessao } from "@/lib/sessao";

export type UsuarioTesteAuth = { id: number; perfil: string };

export async function criarSessaoTeste(usuario: UsuarioTesteAuth) {
  await criarSessao(usuario.id, usuario.perfil);
  const jar = await cookies();
  const token = jar.get("sessao")?.value;
  if (!token) throw new Error("A sessao de teste nao foi criada.");
  return token;
}

export async function limparSessaoTeste() {
  const jar = await cookies();
  jar.delete("sessao");
}

export async function criarTokenExpirado(usuario: UsuarioTesteAuth) {
  const segredo = process.env.SESSION_SECRET;
  if (!segredo) throw new Error("SESSION_SECRET nao configurado nos testes.");
  return new SignJWT({ perfil: usuario.perfil })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuario.id))
    .setIssuedAt()
    .setExpirationTime(946684800)
    .sign(new TextEncoder().encode(segredo));
}

export function adulterarToken(token: string) {
  const partes = token.split(".");
  const payload = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8"));
  payload.perfil = payload.perfil === "ADMIN" ? "MORADOR" : "ADMIN";
  partes[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return partes.join(".");
}

export async function criarTokenComOutroSegredo(usuario: UsuarioTesteAuth) {
  return new SignJWT({ perfil: usuario.perfil })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuario.id))
    .setIssuedAt(1_700_000_000)
    .setExpirationTime(4_102_444_800)
    .sign(new TextEncoder().encode("segredo-diferente-do-segredo-da-aplicacao"));
}
