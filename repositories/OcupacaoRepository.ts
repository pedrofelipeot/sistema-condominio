import type { Prisma } from "@/generated/prisma/client";
import { prisma, type Db } from "@/lib/prisma";

type DadosNovaOcupacao = Pick<
  Prisma.OcupacaoUncheckedCreateInput,
  "usuarioId" | "casaId" | "dataEntrada"
>;

export class OcupacaoRepository {
  static listarPorCasa(casaId: number, db: Db = prisma) {
    return db.ocupacao.findMany({
      where: { casaId },
      include: {
        usuario: { omit: { senhaHash: true } },
      },
      orderBy: [
        { dataSaida: { sort: "asc", nulls: "first" } },
        { usuario: { nome: "asc" } },
      ],
    });
  }

  static listarPorMorador(usuarioId: number, db: Db = prisma) {
    return db.ocupacao.findMany({
      where: { usuarioId },
      orderBy: { dataEntrada: "desc" },
    });
  }

  static buscarMaisRecentePorMorador(usuarioId: number, db: Db = prisma) {
    return db.ocupacao.findFirst({
      where: { usuarioId },
      include: {
        usuario: { omit: { senhaHash: true } },
      },
      orderBy: [
        { dataSaida: { sort: "asc", nulls: "first" } },
        { dataEntrada: "desc" },
      ],
    });
  }

  static buscarAtualDaCasa(casaId: number, db: Db = prisma) {
    return db.ocupacao.findFirst({
      where: { casaId, dataSaida: null },
      include: {
        usuario: { omit: { senhaHash: true } },
      },
    });
  }

  static buscarOcupanteNaData(casaId: number, data: Date, db: Db = prisma) {
    return db.ocupacao.findFirst({
      where: {
        casaId,
        dataEntrada: { lte: data },
        OR: [{ dataSaida: null }, { dataSaida: { gte: data } }],
      },
      include: {
        usuario: { omit: { senhaHash: true } },
      },
    });
  }

  static buscarOcupacaoAtiva(usuarioId: number, db: Db = prisma) {
    return db.ocupacao.findFirst({
      where: { usuarioId, dataSaida: null },
      orderBy: { dataEntrada: "desc" },
    });
  }

  static buscarPeriodoSobreposto(
    usuarioId: number,
    dataEntrada: Date,
    db: Db = prisma,
  ) {
    return db.ocupacao.findFirst({
      where: {
        usuarioId,
        OR: [{ dataSaida: null }, { dataSaida: { gte: dataEntrada } }],
      },
    });
  }

  static buscarPeriodoSobrepostoNaCasa(
    casaId: number,
    dataEntrada: Date,
    db: Db = prisma,
  ) {
    return db.ocupacao.findFirst({
      where: {
        casaId,
        OR: [{ dataSaida: null }, { dataSaida: { gte: dataEntrada } }],
      },
    });
  }

  static criar(dados: DadosNovaOcupacao, db: Db = prisma) {
    return db.ocupacao.create({ data: dados });
  }

  static encerrar(id: number, dataSaida: Date, db: Db = prisma) {
    return db.ocupacao.update({
      where: { id },
      data: { dataSaida },
    });
  }
}