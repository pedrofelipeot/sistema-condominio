import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type DadosNovoAviso = Pick<
  Prisma.AvisoCreateInput,
  "titulo" | "texto"
> & { autorId: number };

type DadosAtualizacaoAviso = Pick<
  Prisma.AvisoUpdateInput,
  "titulo" | "texto"
>;

export class AvisoRepository {
  static listar() {
    return prisma.aviso.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static buscarPorId(id: number) {
    return prisma.aviso.findUnique({ where: { id } });
  }

  static buscarPorTitulo(titulo: string) {
    return prisma.aviso.findMany({
      where: { titulo },
      orderBy: { createdAt: "desc" },
    });
  }

  static criar(aviso: DadosNovoAviso) {
    const dados = {
      titulo: aviso.titulo,
      texto: aviso.texto,
      autor: { connect: { id: aviso.autorId } },
    } satisfies Prisma.AvisoCreateInput;

    return prisma.aviso.create({ data: dados });
  }

  static atualizar(id: number, aviso: DadosAtualizacaoAviso) {
    return prisma.aviso.update({
      where: { id },
      data: aviso,
    });
  }

  static excluir(id: number) {
    return prisma.aviso.delete({ where: { id } });
  }
}
