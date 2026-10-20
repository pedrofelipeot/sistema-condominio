import type { Prisma } from "@/generated/prisma/client";
import { prisma, type Db } from "@/lib/prisma";

type DadosNovoConvite = Pick<
  Prisma.ConviteUncheckedCreateInput,
  "usuarioId" | "tokenHash" | "expiraEm"
>;

export class ConviteRepository {
  static criar(dados: DadosNovoConvite, db: Db = prisma) {
    return db.convite.create({ data: dados });
  }

  static buscarPorTokenHash(tokenHash: string, db: Db = prisma) {
    return db.convite.findUnique({ where: { tokenHash } });
  }

  // Operação atômica: só marca se ainda estiver pendente e dentro da validade.
  // Se duas requisições chegarem juntas, só uma consegue (count === 1).
  static async consumir(id: number, db: Db = prisma) {
    const resultado = await db.convite.updateMany({
      where: { id, usadoEm: null, expiraEm: { gt: new Date() } },
      data: { usadoEm: new Date() },
    });
    return resultado.count === 1;
  }

  // Ao gerar um convite novo, os pendentes anteriores deixam de valer.
  static invalidarPendentesDoUsuario(usuarioId: number, db: Db = prisma) {
    return db.convite.updateMany({
      where: { usuarioId, usadoEm: null, expiraEm: { gt: new Date() } },
      data: { expiraEm: new Date() },
    });
  }
}