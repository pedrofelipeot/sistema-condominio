import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { CobrancaService } from "@/services/CobrancaService";
import { prisma } from "@/lib/prisma";
import { resetDb } from "@/tests/helpers/db";
import { criarAdmin, criarCasa, criarCobranca, criarMorador, criarOcupacao } from "@/tests/helpers/factories";

describe("visibilidade de cobran�as", () => {
  beforeEach(resetDb);
  afterAll(async () => prisma.$disconnect());
  it("mostra cobran�as vencidas durante a ocupa��o", async () => {
    const casa = await criarCasa(); const morador = await criarMorador();
    await criarOcupacao(morador.id, casa.id, { dataEntrada: new Date("2026-03-10"), dataSaida: new Date("2026-03-20") });
    const c = await criarCobranca(casa.id, { vencimento: new Date("2026-03-15") });
    expect((await CobrancaService.listarDoMorador({ id: morador.id, perfil: "MORADOR" })).map(x => x.id)).toEqual([c.id]);
  });
  it("n�o mostra cobran�as anteriores � entrada do morador", async () => {
    const casa = await criarCasa(); const morador = await criarMorador();
    await criarOcupacao(morador.id, casa.id, { dataEntrada: new Date("2026-03-10") });
    await criarCobranca(casa.id, { vencimento: new Date("2026-03-09") });
    expect(await CobrancaService.listarDoMorador({ id: morador.id, perfil: "MORADOR" })).toHaveLength(0);
  });
  it("n�o mostra cobran�as posteriores � sa�da do morador", async () => {
    const casa = await criarCasa(); const morador = await criarMorador();
    await criarOcupacao(morador.id, casa.id, { dataEntrada: new Date("2026-03-01"), dataSaida: new Date("2026-03-10") });
    await criarCobranca(casa.id, { vencimento: new Date("2026-03-11") });
    expect(await CobrancaService.listarDoMorador({ id: morador.id, perfil: "MORADOR" })).toHaveLength(0);
  });
  it("morador novo n�o v� cobran�as do per�odo do antigo", async () => {
    const casa = await criarCasa(); const antigo = await criarMorador(); const novo = await criarMorador();
    await criarOcupacao(antigo.id, casa.id, { dataEntrada: new Date("2026-03-01"), dataSaida: new Date("2026-03-09") });
    await criarOcupacao(novo.id, casa.id, { dataEntrada: new Date("2026-03-10") });
    await criarCobranca(casa.id, { vencimento: new Date("2026-03-05") });
    expect(await CobrancaService.listarDoMorador({ id: novo.id, perfil: "MORADOR" })).toHaveLength(0);
  });
  it("n�o mostra cobran�as de outra casa", async () => {
    const casa = await criarCasa(); const outra = await criarCasa({ numero: 2 }); const morador = await criarMorador();
    await criarOcupacao(morador.id, casa.id); await criarCobranca(outra.id);
    expect(await CobrancaService.listarDoMorador({ id: morador.id, perfil: "MORADOR" })).toHaveLength(0);
  });
  it("admin v� o hist�rico completo", async () => {
    const casa = await criarCasa(); const admin = await criarAdmin(); await criarCobranca(casa.id);
    expect(await CobrancaService.listar({ id: admin.id, perfil: "ADMIN" })).toHaveLength(1);
  });
  it("gera cobranças apenas para casas ocupadas e uma por casa, mesmo com dois moradores", async () => {
    const casa1 = await criarCasa();
    const casa2 = await criarCasa({ numero: 2 });
    const vaga = await criarCasa({ numero: 3 });
    const morador1 = await criarMorador();
    const morador2 = await criarMorador();
    const morador3 = await criarMorador();
    await criarOcupacao(morador1.id, casa1.id);
    await criarOcupacao(morador2.id, casa1.id);
    await criarOcupacao(morador3.id, casa2.id);

    const geradas = await CobrancaService.gerarCobrancasAgendadas({ competencia: "2026-03" });
    expect(geradas).toHaveLength(2);
    expect(geradas.map((c) => c.casaId).sort()).toEqual([casa1.id, casa2.id].sort());
    expect(geradas.some((c) => c.casaId === vaga.id)).toBe(false);
  });

  it("mostra cobrança com vencimento exatamente no dia da entrada", async () => {
    const casa = await criarCasa(); const morador = await criarMorador();
    await criarOcupacao(morador.id, casa.id, { dataEntrada: new Date("2026-03-10T00:00:00.000Z") });
    const cobranca = await criarCobranca(casa.id, { vencimento: new Date("2026-03-10T00:00:00.000Z") });
    const resultado = await CobrancaService.listarDoMorador({ id: morador.id, perfil: "MORADOR" });
    expect(resultado.map((c) => c.id)).toContain(cobranca.id);
  });

  it("mantem visivel a cobrança com vencimento exatamente no dia da saída", async () => {
    const casa = await criarCasa(); const morador = await criarMorador();
    await criarOcupacao(morador.id, casa.id, {
      dataEntrada: new Date("2026-03-01T00:00:00.000Z"),
      dataSaida: new Date("2026-03-10T00:00:00.000Z"),
    });
    const cobranca = await criarCobranca(casa.id, { vencimento: new Date("2026-03-10T00:00:00.000Z") });
    const resultado = await CobrancaService.listarDoMorador({ id: morador.id, perfil: "MORADOR" });
    expect(resultado.map((c) => c.id)).toContain(cobranca.id);
  });});
