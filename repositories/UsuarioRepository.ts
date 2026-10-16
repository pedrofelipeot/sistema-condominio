import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type NovoUsuario = Pick<
  Prisma.UsuarioCreateInput,
  | "nome"
  | "email"
  | "senhaHash"
  | "perfil"
  | "ativo"
  | "precisaTrocarSenha"
>;

type DadosAtualizacaoUsuario = Pick<
  Prisma.UsuarioUpdateInput,
  | "nome"
  | "email"
  | "senhaHash"
  | "precisaTrocarSenha"
>;

const semSenha = { senhaHash: true } as const;

export class UsuarioRepository {
  static listar() {
    return prisma.usuario.findMany({ omit: semSenha });
  }

  static buscarPorId(id: number) {
    return prisma.usuario.findUnique({ where: { id }, omit: semSenha });
  }

  static buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email }, omit: semSenha });
  }

  static buscarPorNome(nome: string) {
    return prisma.usuario.findMany({ where: { nome }, omit: semSenha });
  }

  static criar(usuario: NovoUsuario) {
    const dados = {
      nome: usuario.nome,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
      precisaTrocarSenha: usuario.precisaTrocarSenha,
    } satisfies Prisma.UsuarioCreateInput;

    return prisma.usuario.create({ data: dados, omit: semSenha });
  }

  static atualizar(id: number, usuario: DadosAtualizacaoUsuario) {
    return prisma.usuario.update({
      where: { id },
      data: usuario,
      omit: semSenha,
    });
  }

  static buscarPorEmailComSenha(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  }

  static buscarPorIdComSenha(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  }
}