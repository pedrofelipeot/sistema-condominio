import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieJar } = vi.hoisted(() => {
  const valores = new Map<string, string>();
  return {
    cookieJar: {
      get(nome: string) {
        const value = valores.get(nome);
        return value ? { value } : undefined;
      },
      set(nome: string, value: string) { valores.set(nome, value); },
      delete(nome: string) { valores.delete(nome); },
      clear() { valores.clear(); },
    },
  };
});
vi.mock("next/headers", () => ({ cookies: async () => cookieJar }));

import { GET as avisosGet, POST as avisosPost } from "@/app/api/avisos/route";
import { GET as avisoGet, PATCH as avisoPatch, DELETE as avisoDelete } from "@/app/api/avisos/[id]/route";
import { GET as casasGet } from "@/app/api/casas/route";
import { GET as casaGet, PATCH as casaPatch } from "@/app/api/casas/[id]/route";
import { GET as ocupacoesGet } from "@/app/api/casas/[id]/ocupacoes/route";
import { GET as cobrancasCasaGet } from "@/app/api/casas/[id]/cobrancas/route";
import { GET as cobrancasGet } from "@/app/api/cobrancas/route";
import { PATCH as pagamentoPatch } from "@/app/api/cobrancas/[id]/pagamento/route";
import { POST as moradorPost } from "@/app/api/morador/route";
import { PATCH as moradorPatch } from "@/app/api/morador/[id]/route";
import { POST as convitePost } from "@/app/api/morador/[id]/convite/route";
import { GET as moradorCobrancasGet } from "@/app/api/morador/cobrancas/route";
import { GET as minhaCasaGet } from "@/app/api/morador/minha-casa/route";
import { GET as pixGet } from "@/app/api/morador/pix/route";
import { POST as trocarSenhaPost } from "@/app/api/auth/trocar-senha/route";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as definirSenhaPost } from "@/app/api/auth/definir-senha/route";
import { GET as cronGet } from "@/app/api/cron/gerar-cobrancas/route";
import { prisma } from "@/lib/prisma";
import { gerarTokenConvite, hashToken } from "@/lib/convite";
import { resetDb } from "@/tests/helpers/db";
import { criarAdmin, criarCasa, criarMorador, criarOcupacao } from "@/tests/helpers/factories";
import { criarSessaoTeste } from "@/tests/helpers/auth";
import { OcupacaoService } from "@/services/OcupacaoService";
import { AppError } from "@/errors/AppError";

type Resposta = Promise<Response>;
const ctxId = { params: Promise.resolve({ id: "1" }) };
function req(path: string, method = "GET", body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    ...(body === undefined ? {} : {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  });
}

const rotasProtegidas: { name: string; executar: () => Resposta }[] = [
  { name: "POST /api/auth/trocar-senha", executar: () => trocarSenhaPost(req("/api/auth/trocar-senha", "POST", {})) },
  { name: "GET /api/avisos", executar: () => avisosGet(req("/api/avisos")) },
  { name: "POST /api/avisos", executar: () => avisosPost(req("/api/avisos", "POST", {})) },
  { name: "GET /api/avisos/[id]", executar: () => avisoGet(req("/api/avisos/1"), ctxId) },
  { name: "PATCH /api/avisos/[id]", executar: () => avisoPatch(req("/api/avisos/1", "PATCH", {}), ctxId) },
  { name: "DELETE /api/avisos/[id]", executar: () => avisoDelete(req("/api/avisos/1", "DELETE"), ctxId) },
  { name: "GET /api/casas", executar: () => casasGet() },
  { name: "GET /api/casas/[id]", executar: () => casaGet(req("/api/casas/1"), ctxId) },
  { name: "PATCH /api/casas/[id]", executar: () => casaPatch(req("/api/casas/1", "PATCH", {}), ctxId) },
  { name: "GET /api/casas/[id]/ocupacoes", executar: () => ocupacoesGet(req("/api/casas/1/ocupacoes"), ctxId) },
  { name: "GET /api/casas/[id]/cobrancas", executar: () => cobrancasCasaGet(req("/api/casas/1/cobrancas"), ctxId) },
  { name: "GET /api/cobrancas", executar: () => cobrancasGet() },
  { name: "PATCH /api/cobrancas/[id]/pagamento", executar: () => pagamentoPatch(req("/api/cobrancas/1/pagamento", "PATCH", {}), ctxId) },
  { name: "POST /api/morador", executar: () => moradorPost(req("/api/morador", "POST", {})) },
  { name: "PATCH /api/morador/[id]", executar: () => moradorPatch(req("/api/morador/1", "PATCH", {}), ctxId) },
  { name: "POST /api/morador/[id]/convite", executar: () => convitePost(req("/api/morador/1/convite", "POST"), ctxId) },
  { name: "GET /api/morador/cobrancas", executar: () => moradorCobrancasGet() },
  { name: "GET /api/morador/minha-casa", executar: () => minhaCasaGet() },
  { name: "GET /api/morador/pix", executar: () => pixGet() },
];

describe("autorizacao dos handlers de API", () => {
  beforeEach(async () => { await resetDb(); cookieJar.clear(); });
  afterAll(async () => prisma.$disconnect());

  it.each(rotasProtegidas)("$name bloqueia chamada sem sessao", async ({ executar }) => {
    expect((await executar()).status).toBe(401);
  });

  it("morador recebe 403 nas rotas administrativas", async () => {
    const morador = await criarMorador();
    await criarSessaoTeste(morador);
    expect((await casasGet()).status).toBe(403);
    expect((await cobrancasGet()).status).toBe(403);
    expect((await avisosPost(req("/api/avisos", "POST", { titulo: "Aviso valido", texto: "Texto valido" }))).status).toBe(403);
  });

  // Comportamento correto esperado: GET da casa e restrito a admin; hoje o handler so exige sessao.
  it("morador nao pode ler outra casa pelo id", async () => {
    const casa = await criarCasa();
    const morador = await criarMorador();
    await criarSessaoTeste(morador);
    expect((await casaGet(req(`/api/casas/${casa.id}`), { params: Promise.resolve({ id: String(casa.id) }) })).status).toBe(403);
  });

  // Comportamento correto esperado: admins nao devem usar a rota exclusiva do morador; hoje ela retorna [] com 200.
  it("admin recebe 403 ao consultar cobrancas pela rota do morador", async () => {
    const admin = await criarAdmin();
    await criarSessaoTeste(admin);
    expect((await moradorCobrancasGet()).status).toBe(403);
  });

  it("admin acessa rotas administrativas e uma rota de morador liberada a qualquer logado", async () => {
    const admin = await criarAdmin();
    await criarSessaoTeste(admin);
    expect((await casasGet()).status).toBe(200);
    expect((await pixGet()).status).toBe(200);
  });

  it("morador e admin acessam a configuracao PIX; sem sessao e bloqueado", async () => {
    const morador = await criarMorador();
    await criarSessaoTeste(morador);
    expect((await pixGet()).status).toBe(200);
    const admin = await criarAdmin();
    await criarSessaoTeste(admin);
    expect((await pixGet()).status).toBe(200);
  });

  it("morador nao acessa ocupacoes de outra casa por id", async () => {
    const casa = await criarCasa();
    const morador = await criarMorador();
    await criarSessaoTeste(morador);
    const response = await ocupacoesGet(req(`/api/casas/${casa.id}/ocupacoes`), { params: Promise.resolve({ id: String(casa.id) }) });
    expect(response.status).toBe(403);
  });

  it("morador nao pode operar sobre outro morador por id", async () => {
    const outro = await criarMorador();
    const morador = await criarMorador();
    await criarSessaoTeste(morador);
    const response = await convitePost(req(`/api/morador/${outro.id}/convite`, "POST"), { params: Promise.resolve({ id: String(outro.id) }) });
    expect(response.status).toBe(403);
  });

  it.each([
    ["minha casa", () => minhaCasaGet()],
    ["PIX", () => pixGet()],
    ["avisos", () => avisosGet(req("/api/avisos"))],
  ])("sessao de usuario desativado e rejeitada em %s", async (_nome, executar) => {
    const casa = await criarCasa();
    const morador = await criarMorador();
    const admin = await criarAdmin();
    await OcupacaoService.admitirMorador(morador.id, casa.id, new Date("2026-03-10T00:00:00.000Z"));
    await criarSessaoTeste(morador);
    await OcupacaoService.encerrarMoradia(morador.id, new Date("2026-03-20T00:00:00.000Z"), { id: admin.id, perfil: "ADMIN" });
    expect((await executar()).status).toBe(401);
  });

  it.each([
    ["POST /api/avisos", () => avisosPost(req("/api/avisos", "POST", {}))],
    ["PATCH /api/avisos/[id]", () => avisoPatch(req("/api/avisos/1", "PATCH", {}), ctxId)],
    ["POST /api/auth/login", () => loginPost(req("/api/auth/login", "POST", {}))],
    ["POST /api/auth/definir-senha", () => definirSenhaPost(req("/api/auth/definir-senha", "POST", {}))],
    ["POST /api/morador", () => moradorPost(req("/api/morador", "POST", {}))],
    ["PATCH /api/cobrancas/[id]/pagamento", () => pagamentoPatch(req("/api/cobrancas/1/pagamento", "PATCH", {}), ctxId)],
  ])("entrada vazia e rejeitada em %s", async (_nome, executar) => {
    const admin = await criarAdmin();
    await criarSessaoTeste(admin);
    expect((await executar()).status).toBe(400);
  });

  it("convite invalido, usado e expirado e rejeitado; convite valido so funciona uma vez", async () => {
    const token = gerarTokenConvite().token;
    const invalid = await definirSenhaPost(req("/api/auth/definir-senha", "POST", {
      token: "token-invalido-com-tamanho-suficiente",
      novaSenha: "SenhaValida123!",
      confirmarSenha: "SenhaValida123!",
    }));
    expect(invalid.status).toBe(400);

    const morador = await criarMorador();
    const usado = gerarTokenConvite();
    await prisma.convite.create({ data: { usuarioId: morador.id, tokenHash: usado.tokenHash, expiraEm: new Date("2999-01-01T00:00:00.000Z"), usadoEm: new Date("2026-03-01T00:00:00.000Z") } });
    const respostaUsado = await definirSenhaPost(req("/api/auth/definir-senha", "POST", { token: usado.token, novaSenha: "SenhaValida123!", confirmarSenha: "SenhaValida123!" }));
    expect(respostaUsado.status).toBe(400);

    const expirado = gerarTokenConvite();
    await prisma.convite.create({ data: { usuarioId: morador.id, tokenHash: expirado.tokenHash, expiraEm: new Date("2000-01-01T00:00:00.000Z") } });
    const respostaExpirado = await definirSenhaPost(req("/api/auth/definir-senha", "POST", { token: expirado.token, novaSenha: "SenhaValida123!", confirmarSenha: "SenhaValida123!" }));
    expect(respostaExpirado.status).toBe(400);

    await prisma.convite.create({ data: { usuarioId: morador.id, tokenHash: hashToken(token), expiraEm: new Date("2999-01-01T00:00:00.000Z") } });
    const payload = { token, novaSenha: "SenhaValida123!", confirmarSenha: "SenhaValida123!" };
    const primeira = await definirSenhaPost(req("/api/auth/definir-senha", "POST", payload));
    expect(primeira.status).toBe(204);
    const segunda = await definirSenhaPost(req("/api/auth/definir-senha", "POST", payload));
    expect(segunda.status).toBe(400);
  });

  it("cron exige segredo correto e repeticao na mesma competencia nao duplica", async () => {
    const anterior = process.env.CRON_SECRET;
    try {
      delete process.env.CRON_SECRET;
      expect((await cronGet(req("/api/cron/gerar-cobrancas"))).status).toBe(500);
      process.env.CRON_SECRET = "cron-teste-seguro";
      expect((await cronGet(req("/api/cron/gerar-cobrancas", "GET"))).status).toBe(401);

      const casa = await criarCasa();
      const morador = await criarMorador();
      await criarOcupacao(morador.id, casa.id);
      vi.useFakeTimers({ now: new Date("2026-03-10T12:00:00.000Z") });
      const requestComSegredo = () => new Request("http://localhost/api/cron/gerar-cobrancas", { headers: { authorization: "Bearer cron-teste-seguro" } });
      const primeira = await cronGet(requestComSegredo());
      expect(primeira.status).toBe(200);
      expect(await primeira.json()).toMatchObject({ competencia: "2026-03", total: 1 });
      const segunda = await cronGet(requestComSegredo());
      expect(segunda.status).toBe(200);
      expect(await prisma.cobranca.count({ where: { casaId: casa.id, competencia: "2026-03" } })).toBe(1);
    } finally {
      vi.useRealTimers();
      if (anterior === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = anterior;
    }
  });
});
