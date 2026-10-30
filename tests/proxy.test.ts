import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieJar } = vi.hoisted(() => {
  const valores = new Map<string, string>();
  return {
    cookieJar: {
      get(nome: string) { const value = valores.get(nome); return value ? { value } : undefined; },
      set(nome: string, value: string) { valores.set(nome, value); },
      delete(nome: string) { valores.delete(nome); },
      clear() { valores.clear(); },
    },
  };
});
vi.mock("next/headers", () => ({ cookies: async () => cookieJar }));

import { NextRequest } from "next/server";
import { proxy as authProxy } from "@/proxy";
import { prisma } from "@/lib/prisma";
import { resetDb } from "@/tests/helpers/db";
import { criarAdmin, criarMorador } from "@/tests/helpers/factories";
import { adulterarToken, criarSessaoTeste, criarTokenComOutroSegredo, criarTokenExpirado } from "@/tests/helpers/auth";

function request(path: string, token?: string) {
  const req = new NextRequest(new URL(path, "http://localhost"));
  if (token) req.cookies.set("sessao", token);
  return req;
}

function destino(response: Response) {
  return response.headers.get("location");
}

describe("protecao das paginas pelo proxy", () => {
  beforeEach(async () => { await resetDb(); cookieJar.clear(); });
  afterAll(async () => prisma.$disconnect());

  it.each(["/admin", "/morador"])("sem cookie redireciona %s para login", async (path) => {
    const response = await authProxy(request(path));
    expect(response?.status).toBe(307);
    expect(destino(response!)).toBe("http://localhost/login");
  });

  it("JWT invalido redireciona para login", async () => {
    const response = await authProxy(request("/admin", "nao.e.um.jwt"));
    expect(destino(response!)).toBe("http://localhost/login");
  });

  it("payload adulterado sem assinatura correspondente redireciona para login", async () => {
    const morador = await criarMorador();
    const token = await criarSessaoTeste(morador);
    const response = await authProxy(request("/morador", adulterarToken(token)));
    expect(destino(response!), JSON.stringify({ status: response?.status, headers: [...(response?.headers ?? [])] })).toBe("http://localhost/login");
  });

  it("token assinado com outro segredo redireciona para login", async () => {
    const morador = await criarMorador();
    const token = await criarTokenComOutroSegredo(morador);
    const response = await authProxy(request("/morador", token));
    expect(destino(response!), JSON.stringify({ status: response?.status, headers: [...(response?.headers ?? [])] })).toBe("http://localhost/login");
  });

  it("JWT expirado redireciona para login", async () => {
    const morador = await criarMorador();
    const response = await authProxy(request("/morador", await criarTokenExpirado(morador)));
    expect(destino(response!)).toBe("http://localhost/login");
  });

  it.each([undefined, "nao.e.um.jwt"]) ("/login abre normalmente sem cookie ou com token inválido", async (token) => {
    const response = await authProxy(request("/login", token));
    expect(response?.headers.get("x-middleware-next")).toBe("1");
  });

  it("/login abre normalmente com payload adulterado", async () => {
    const morador = await criarMorador();
    const response = await authProxy(request("/login", adulterarToken(await criarSessaoTeste(morador))));
    expect(response?.headers.get("x-middleware-next")).toBe("1");
  });

  it("/login abre normalmente com token expirado", async () => {
    const morador = await criarMorador();
    const response = await authProxy(request("/login", await criarTokenExpirado(morador)));
    expect(response?.headers.get("x-middleware-next")).toBe("1");
  });

  it("admin com sessão válida em /login é redirecionado para /admin", async () => {
    const admin = await criarAdmin();
    const response = await authProxy(request("/login", await criarSessaoTeste(admin)));
    expect(destino(response!)).toBe("http://localhost/admin");
  });

  it("morador com sessão válida em /login é redirecionado para /morador", async () => {
    const morador = await criarMorador();
    const response = await authProxy(request("/login", await criarSessaoTeste(morador)));
    expect(destino(response!)).toBe("http://localhost/morador");
  });

  it("morador em /admin e redirecionado para a area do morador", async () => {
    const morador = await criarMorador();
    const response = await authProxy(request("/admin", await criarSessaoTeste(morador)));
    expect(destino(response!)).toBe("http://localhost/morador");
  });

  it("admin em /morador e redirecionado para a area admin", async () => {
    const admin = await criarAdmin();
    const response = await authProxy(request("/morador", await criarSessaoTeste(admin)));
    expect(destino(response!)).toBe("http://localhost/admin");
  });

  it("perfil correto passa nas respectivas areas", async () => {
    const admin = await criarAdmin();
    const morador = await criarMorador();
    const respostaAdmin = await authProxy(request("/admin", await criarSessaoTeste(admin)));
    const respostaMorador = await authProxy(request("/morador", await criarSessaoTeste(morador)));
    expect(respostaAdmin?.headers.get("x-middleware-next")).toBe("1");
    expect(respostaMorador?.headers.get("x-middleware-next")).toBe("1");
  });
});
