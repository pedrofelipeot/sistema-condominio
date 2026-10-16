import { prisma, type Db } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type DadosNovoUsuario = Pick<
  Prisma.UsuarioUncheckedCreateInput,
  "nome" | "email" | "senhaHash" | "perfil" | "ativo" | "precisaTrocarSenha"
>;

type DadosAtualizacaoUsuario = Pick<
  Prisma.UsuarioUncheckedUpdateInput,
  "nome" | "email" | "senhaHash" | "precisaTrocarSenha" | "ativo"
>;

const semSenha = { senhaHash: true } as const;

export class UsuarioRepository {
  static listar(db: Db = prisma) {
    return db.usuario.findMany({ omit: semSenha });
  }

  static buscarPorId(id: number, db: Db = prisma) {
    return db.usuario.findUnique({ where: { id }, omit: semSenha });
  }

  static buscarPorEmail(email: string, db: Db = prisma) {
    return db.usuario.findUnique({ where: { email }, omit: semSenha });
  }

  static buscarPorNome(nome: string, db: Db = prisma) {
    return db.usuario.findMany({ where: { nome }, omit: semSenha });
  }

  static criar(usuario: DadosNovoUsuario, db: Db = prisma) {
    return db.usuario.create({ data: usuario, omit: semSenha });
  }

  static atualizar(
    id: number,
    usuario: DadosAtualizacaoUsuario,
    db: Db = prisma,
  ) {
    return db.usuario.update({ where: { id }, data: usuario, omit: semSenha });
  }

  static buscarPorEmailComSenha(email: string, db: Db = prisma) {
    return db.usuario.findUnique({ where: { email } });
  }

  static buscarPorIdComSenha(id: number, db: Db = prisma) {
    return db.usuario.findUnique({ where: { id } });
  }
}