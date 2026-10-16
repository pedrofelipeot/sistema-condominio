import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type NovaCasa = Pick<
  Prisma.CasaCreateInput,
  "numero" | "quartos" | "valorAluguel" | "diaVencimento"
>;

type AtualizacaoCasa = Partial<NovaCasa>;

export class CasaRepository {
  static listar() {
    return prisma.casa.findMany({
      orderBy: { numero: "asc" },
    });
  }

  static buscarPorId(id: number) {
    return prisma.casa.findUnique({
      where: { id },
    });
  }

  static buscarPorNumero(numero: number) {
    return prisma.casa.findUnique({
      where: { numero },
    });
  }

  static criar(casa: NovaCasa) {
    const dados = {
      numero: casa.numero,
      quartos: casa.quartos,
      valorAluguel: casa.valorAluguel,
      diaVencimento: casa.diaVencimento,
    } satisfies Prisma.CasaCreateInput;

    return prisma.casa.create({ data: dados });
  }

  static atualizar(id: number, casa: AtualizacaoCasa) {
    const dados = {
      ...(casa.numero !== undefined && { numero: casa.numero }),
      ...(casa.quartos !== undefined && { quartos: casa.quartos }),
      ...(casa.valorAluguel !== undefined && {
        valorAluguel: casa.valorAluguel,
      }),
      ...(casa.diaVencimento !== undefined && {
        diaVencimento: casa.diaVencimento,
      }),
    } satisfies Prisma.CasaUpdateInput;

    return prisma.casa.update({
      where: { id },
      data: dados,
    });
  }

  static excluir(id: number) {
    return prisma.casa.delete({
      where: { id },
    });
  }
}
