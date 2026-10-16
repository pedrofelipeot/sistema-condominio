import type { Prisma } from "@/generated/prisma/client";
import { fimDoDiaUTC } from "@/lib/date";
import { prisma, type Db } from "@/lib/prisma";

type DadosNovaCobranca = Pick<
  Prisma.CobrancaUncheckedCreateInput,
  | "casaId"
  | "competencia"
  | "valor"
  | "vencimento"
  | "status"
  | "pagoEm"
  | "formaPagamento"
>;

type DadosAtualizacaoPagamento = Pick<
  Prisma.CobrancaUncheckedUpdateInput,
  "status" | "pagoEm" | "formaPagamento"
>;

export class CobrancaRepository {
  static listarTodas(db: Db = prisma) {
    return db.cobranca.findMany({
      include: { casa: true },
      orderBy: [{ vencimento: "desc" }, { casaId: "asc" }],
    });
  }

  static listarPorCasa(casaId: number, db: Db = prisma) {
    return db.cobranca.findMany({
      where: { casaId },
      orderBy: { vencimento: "desc" },
    });
  }

  static buscarPorId(id: number, db: Db = prisma) {
    return db.cobranca.findUnique({
      where: { id },
      include: { casa: true },
    });
  }

  static listarPorPeriodos(
    periodos: {
      casaId: number;
      dataEntrada: Date;
      dataSaida: Date | null;
    }[],
    db: Db = prisma,
  ) {
    if (periodos.length === 0) {
      return Promise.resolve([]);
    }

    const filtros: Prisma.CobrancaWhereInput[] = periodos.map(
      ({ casaId, dataEntrada, dataSaida }) => ({
        casaId,
        vencimento: {
          gte: dataEntrada,
          ...(dataSaida ? { lte: fimDoDiaUTC(dataSaida) } : {}),
        },
      }),
    );

    return db.cobranca.findMany({
      where: { OR: filtros },
      orderBy: { vencimento: "desc" },
    });
  }

  static criar(dados: DadosNovaCobranca, db: Db = prisma) {
    return db.cobranca.create({ data: dados });
  }

  static criarSeNaoExistir(dados: DadosNovaCobranca, db: Db = prisma) {
    const { casaId, competencia } = dados;

    return db.cobranca.upsert({
      where: { casaId_competencia: { casaId, competencia } },
      update: {},
      create: dados,
    });
  }

  static atualizar(
    id: number,
    dados: DadosAtualizacaoPagamento,
    db: Db = prisma,
  ) {
    return db.cobranca.update({
      where: { id },
      data: dados,
    });
  }
}