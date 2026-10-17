import type { Prisma } from "@/generated/prisma/client";
import { prisma, type Db } from "@/lib/prisma";

type DadosNovaCasa = Pick<
  Prisma.CasaUncheckedCreateInput,
  "numero" | "quartos" | "valorAluguel" | "diaVencimento"
>;

type DadosAtualizacaoCasa = Pick<
  Prisma.CasaUncheckedUpdateInput,
  "numero" | "quartos" | "valorAluguel" | "diaVencimento"
>;

export class CasaRepository {
  static listar(db: Db = prisma) {
    return db.casa.findMany({
      orderBy: { numero: "asc" },
    });
  }

  static buscarPorId(id: number, db: Db = prisma) {
    return db.casa.findUnique({ where: { id } });
  }

  static buscarPorNumero(numero: number, db: Db = prisma) {
    return db.casa.findUnique({ where: { numero } });
  }

  static criar(casa: DadosNovaCasa, db: Db = prisma) {
    return db.casa.create({ data: casa });
  }

  static atualizar(id: number, casa: DadosAtualizacaoCasa, db: Db = prisma) {
    return db.casa.update({
      where: { id },
      data: casa,
    });
  }

  static excluir(id: number, db: Db = prisma) {
    return db.casa.delete({ where: { id } });
  }
}
