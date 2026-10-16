import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type NovaOcupacao = {
  usuarioId: number;
  casaId: number;
  dataEntrada: Date;
};

export class OcupacaoRepository {
  static listarPorCasa(casaId: number) {
    return prisma.ocupacao.findMany({
      where: { casaId },
      include: {
        usuario: {
          omit: { senhaHash: true },
        },
      },
      orderBy: { dataEntrada: "desc" },
    });
  }

  static listarPorMorador(usuarioId: number) {
    return prisma.ocupacao.findMany({
      where: { usuarioId },
      orderBy: { dataEntrada: "desc" },
    });
  }

  static buscarOcupacaoAtiva(usuarioId: number, tx: Prisma.TransactionClient) {
    return tx.ocupacao.findFirst({
      where: { usuarioId, dataSaida: null },
      orderBy: { dataEntrada: "desc" },
    });
  }

  static buscarPeriodoSobreposto(
    usuarioId: number,
    dataEntrada: Date,
    tx: Prisma.TransactionClient,
  ) {
    return tx.ocupacao.findFirst({
      where: {
        usuarioId,
        OR: [{ dataSaida: null }, { dataSaida: { gte: dataEntrada } }],
      },
    });
  }

  static criar(
    dados: NovaOcupacao,
    tx: Prisma.TransactionClient,
  ) {
    const dadosPrisma = {
      dataEntrada: dados.dataEntrada,
      usuario: { connect: { id: dados.usuarioId } },
      casa: { connect: { id: dados.casaId } },
    } satisfies Prisma.OcupacaoCreateInput;

    return tx.ocupacao.create({ data: dadosPrisma });
  }

  static encerrar(id: number, dataSaida: Date, tx: Prisma.TransactionClient) {
    return tx.ocupacao.update({
      where: { id },
      data: { dataSaida },
    });
  }
}
