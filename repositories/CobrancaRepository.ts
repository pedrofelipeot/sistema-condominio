import type { Prisma } from "@/generated/prisma/client";
import { fimDoDiaUTC } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type DadosNovaCobranca = Pick<
  Prisma.CobrancaCreateInput,
  | "competencia"
  | "valor"
  | "vencimento"
  | "status"
  | "pagoEm"
  | "formaPagamento"
> & { casaId: number };
type DadosAtualizacaoPagamento = Pick<
  Prisma.CobrancaUpdateInput,
  "status" | "pagoEm" | "formaPagamento"
>;

export class CobrancaRepository {
  static listarTodas() {
    return prisma.cobranca.findMany({
      include: { casa: true },
      orderBy: [{ vencimento: "desc" }, { casaId: "asc" }],
    });
  }

  static listarPorCasa(casaId: number) {
    return prisma.cobranca.findMany({
      where: { casaId },
      orderBy: { vencimento: "desc" },
    });
  }

  static buscarPorId(id: number) {
    return prisma.cobranca.findUnique({
      where: { id },
      include: { casa: true },
    });
  }

  static async listarVisiveisParaMorador(usuarioId: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { perfil: true, ativo: true },
    });

    if (!usuario || usuario.perfil !== "MORADOR" || !usuario.ativo) {
      return [];
    }

    const ocupacoes = await prisma.ocupacao.findMany({
      where: { usuarioId },
      select: { casaId: true, dataEntrada: true, dataSaida: true },
    });

    if (ocupacoes.length === 0) {
      return [];
    }

    const periodosVisiveis: Prisma.CobrancaWhereInput[] = ocupacoes.map(
      ({ casaId, dataEntrada, dataSaida }) => ({
        casaId,
        vencimento: {
          gte: dataEntrada,
          ...(dataSaida ? { lte: fimDoDiaUTC(dataSaida) } : {}),
        },
      }),
    );

    return prisma.cobranca.findMany({
      where: { OR: periodosVisiveis },
      orderBy: { vencimento: "desc" },
    });
  }

  static criar(dados: DadosNovaCobranca) {
    const { casaId, ...campos } = dados;
    const dadosPrisma = {
      ...campos,
      casa: { connect: { id: casaId } },
    } satisfies Prisma.CobrancaCreateInput;

    return prisma.cobranca.create({ data: dadosPrisma });
  }

  static criarSeNaoExistir(dados: DadosNovaCobranca) {
    const { casaId, competencia, ...campos } = dados;

    return prisma.cobranca.upsert({
      where: { casaId_competencia: { casaId, competencia } },
      update: {},
      create: {
        ...campos,
        competencia,
        casa: { connect: { id: casaId } },
      } satisfies Prisma.CobrancaCreateInput,
    });
  }

  static atualizar(id: number, dados: DadosAtualizacaoPagamento) {
    return prisma.cobranca.update({
      where: { id },
      data: dados,
    });
  }
}