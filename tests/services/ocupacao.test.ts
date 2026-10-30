import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { OcupacaoService } from "@/services/OcupacaoService";
import { AppError } from '@/errors/AppError';
import { prisma } from "@/lib/prisma";
import { resetDb } from "@/tests/helpers/db";
import { criarAdmin, criarCasa, criarMorador, criarOcupacao } from "@/tests/helpers/factories";

describe("OcupacaoService", () => {
  beforeEach(resetDb);
  afterAll(async () => prisma.$disconnect());
  it("admite morador em casa vaga", async () => {
    const casa = await criarCasa(); const morador = await criarMorador();
    const o = await OcupacaoService.admitirMorador(morador.id, casa.id, new Date("2026-03-10"));
    expect(o.dataSaida).toBeNull();
  });
  it("encerra ocupação e atualiza o status do morador", async () => {
    const casa = await criarCasa(); const morador = await criarMorador(); const admin = await criarAdmin();
    await criarOcupacao(morador.id, casa.id);
    const fim = await OcupacaoService.encerrarMoradia(morador.id, new Date("2026-03-20"), { id: admin.id, perfil: "ADMIN" });
    expect(fim.dataSaida).toEqual(new Date("2026-03-20T23:59:59.999Z"));
    expect(await prisma.ocupacao.count({ where: { casaId: casa.id, dataSaida: null } })).toBe(0);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: morador.id } })).ativo).toBe(false);
  });
  it("nao admite o mesmo morador em duas ocupacoes ativas", async () => {
    const casa1 = await criarCasa(); const casa2 = await criarCasa({ numero: 2 }); const morador = await criarMorador();
    await OcupacaoService.admitirMorador(morador.id, casa1.id, new Date("2026-03-10"));
    const admissao = OcupacaoService.admitirMorador(morador.id, casa2.id, new Date("2026-03-11"));
    await expect(admissao).rejects.toBeInstanceOf(AppError);
    await expect(admissao)
      .rejects.toMatchObject({ status: 409, message: "O morador ja possui uma ocupacao ativa." });
    await expect(prisma.ocupacao.count({ where: { usuarioId: morador.id, dataSaida: null } })).resolves.toBe(1);
  });
  it("permite moradores diferentes com ocupacao ativa na mesma casa", async () => {
    const casa = await criarCasa(); const a = await criarMorador(); const b = await criarMorador();
    await OcupacaoService.admitirMorador(a.id, casa.id, new Date("2026-03-10"));
    await OcupacaoService.admitirMorador(b.id, casa.id, new Date("2026-03-11"));
    expect(await prisma.ocupacao.count({ where: { casaId: casa.id, dataSaida: null } })).toBe(2);
  });
  it("permite reentrada do morador apos o encerramento, sem sobreposicao", async () => {
    const casa = await criarCasa(); const morador = await criarMorador();
    await criarOcupacao(morador.id, casa.id, {
      dataEntrada: new Date("2026-03-01T00:00:00.000Z"),
      dataSaida: new Date("2026-03-10T00:00:00.000Z"),
    });
    const nova = await OcupacaoService.admitirMorador(morador.id, casa.id, new Date("2026-03-11T00:00:00.000Z"));
    expect(nova.dataSaida).toBeNull();
    expect(await prisma.ocupacao.count({ where: { usuarioId: morador.id } })).toBe(2);
  });

  it("rejeita reentrada com datas sobrepostas a ocupacao encerrada", async () => {
    const casa = await criarCasa(); const morador = await criarMorador();
    await criarOcupacao(morador.id, casa.id, {
      dataEntrada: new Date("2026-03-01T00:00:00.000Z"),
      dataSaida: new Date("2026-03-20T00:00:00.000Z"),
    });
    const resultado = await OcupacaoService.admitirMorador(morador.id, casa.id, new Date("2026-03-15T00:00:00.000Z")).catch((e: unknown) => e);
    expect(resultado).toBeInstanceOf(AppError);
    expect(resultado).toMatchObject({ status: 409 });
  });});
