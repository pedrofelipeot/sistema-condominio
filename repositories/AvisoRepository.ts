import type { Prisma } from "@/generated/prisma/client";
import { prisma, type Db } from "@/lib/prisma";

type DadosNovoAviso = Pick<
  Prisma.AvisoUncheckedCreateInput,
  "titulo" | "texto" | "autorId"
>;

type DadosAtualizacaoAviso = Pick<
  Prisma.AvisoUncheckedUpdateInput,
  "titulo" | "texto"
>;

type FiltrosAviso = {
  busca?: string;
};

export class AvisoRepository {
  static listar(filtros: FiltrosAviso = {}, db: Db = prisma) {
    const { busca } = filtros;

    return db.aviso.findMany({
      where: busca
        ? {
            OR: [
              { titulo: { contains: busca } },
              { texto: { contains: busca } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  static buscarPorId(id: number, db: Db = prisma) {
    return db.aviso.findUnique({ where: { id } });
  }

  static buscarPorTitulo(titulo: string, db: Db = prisma) {
    return db.aviso.findMany({
      where: { titulo },
      orderBy: { createdAt: "desc" },
    });
  }

  static criar(aviso: DadosNovoAviso, db: Db = prisma) {
    return db.aviso.create({ data: aviso });
  }

  static atualizar(
    id: number,
    aviso: DadosAtualizacaoAviso,
    db: Db = prisma,
  ) {
    return db.aviso.update({
      where: { id },
      data: aviso,
    });
  }

  static excluir(id: number, db: Db = prisma) {
    return db.aviso.delete({ where: { id } });
  }
}
