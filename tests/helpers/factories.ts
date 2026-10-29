import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
let seq = 0;
export function criarCasa(overrides: Partial<Prisma.CasaUncheckedCreateInput> = {}) {
  return prisma.casa.create({ data: { numero: 1, quartos: 2, valorAluguel: new Prisma.Decimal("1200.00"), diaVencimento: 10, ...overrides } });
}
export function criarAdmin(overrides: Partial<Prisma.UsuarioUncheckedCreateInput> = {}) {
  seq++;
  return prisma.usuario.create({ data: { nome: "Admin teste", email: `admin-${seq}@teste.local`, senhaHash: "hash-teste", perfil: "ADMIN", ativo: true, precisaTrocarSenha: false, ...overrides } });
}
export function criarMorador(overrides: Partial<Prisma.UsuarioUncheckedCreateInput> = {}) {
  seq++;
  return prisma.usuario.create({ data: { nome: "Morador teste", email: `morador-${seq}@teste.local`, senhaHash: "hash-teste", perfil: "MORADOR", ativo: true, precisaTrocarSenha: false, ...overrides } });
}
export function criarOcupacao(usuarioId: number, casaId: number, overrides: Partial<Prisma.OcupacaoUncheckedCreateInput> = {}) {
  return prisma.ocupacao.create({ data: { usuarioId, casaId, dataEntrada: new Date("2026-03-10T00:00:00.000Z"), ...overrides } });
}
export function criarCobranca(casaId: number, overrides: Partial<Prisma.CobrancaUncheckedCreateInput> = {}) {
  return prisma.cobranca.create({ data: { casaId, competencia: "2026-03", valor: new Prisma.Decimal("1200.00"), vencimento: new Date("2026-03-10T00:00:00.000Z"), status: "PENDENTE", ...overrides } });
}
