import bcrypt from "bcryptjs";
import { AppError } from "@/errors/AppError";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import type { LoginInput, TrocarSenhaInput } from "@/validators/schemas";
import { prisma } from "@/lib/prisma";
import { exigirAdmin, type Solicitante } from "@/lib/sessao";
import { expiracaoConvite, gerarTokenConvite, hashToken, montarLinkConvite } from "@/lib/convite";
import { hashSenha } from "@/lib/senha";
import { ConviteRepository } from "@/repositories/ConviteRepository";
import type { DefinirSenhaInput } from "@/validators/schemas";

const CUSTO_HASH = 10;
// Hash de mentira: usado quando o e-mail não existe, para o tempo de resposta
// ser parecido e ninguém descobrir quais e-mails estão cadastrados
const HASH_FALSO = bcrypt.hashSync("senha-falsa", CUSTO_HASH);

export class AuthService {
  static async login(dados: LoginInput) {
    const usuario = await UsuarioRepository.buscarPorEmailComSenha(dados.email);

    const senhaOk = await bcrypt.compare(
      dados.senha,
      usuario?.senhaHash ?? HASH_FALSO,
    );

    // mesma mensagem para "não existe" e "senha errada"
    if (!usuario || !senhaOk) {
      throw new AppError("E-mail ou senha inválidos.", 401);
    }

    if (!usuario.ativo) {
      throw new AppError("Usuário inativo.", 403);
    }

    return {
      id: usuario.id,
      perfil: usuario.perfil,
      precisaTrocarSenha: usuario.precisaTrocarSenha,
    };
  }

  static async trocarSenha(usuarioId: number, dados: TrocarSenhaInput) {
    const usuario = await UsuarioRepository.buscarPorIdComSenha(usuarioId);
    if (!usuario) throw new AppError("Usuário não encontrado.", 404);

    const senhaOk = await bcrypt.compare(dados.senhaAtual, usuario.senhaHash);
    if (!senhaOk) throw new AppError("Senha atual incorreta.", 401);

    const senhaHash = await bcrypt.hash(dados.novaSenha, CUSTO_HASH);

    await UsuarioRepository.atualizar(usuarioId, {
      senhaHash,
      precisaTrocarSenha: false,
    });
  }

  // Rota pública: quem chama ainda não tem sessão
static async definirSenha(dados: DefinirSenhaInput) {
  // mesma mensagem para inexistente, expirado e já usado
  const conviteInvalido = () =>
    new AppError("Convite inválido, expirado ou já utilizado.", 400);

  const convite = await ConviteRepository.buscarPorTokenHash(hashToken(dados.token));
  if (!convite || convite.usadoEm || convite.expiraEm <= new Date()) {
    throw conviteInvalido();
  }

  const senhaHash = await hashSenha(dados.novaSenha);

  await prisma.$transaction(async (tx) => {
    const consumido = await ConviteRepository.consumir(convite.id, tx);
    if (!consumido) throw conviteInvalido(); // outra requisição usou antes

    await UsuarioRepository.atualizar(
      convite.usuarioId,
      { senhaHash, precisaTrocarSenha: false },
      tx,
    );
  });
}

// Convite expirou, ou o morador esqueceu a senha: o admin gera um novo link
static async reenviarConvite(usuarioId: number, solicitante: Solicitante) {
  exigirAdmin(solicitante);

  const usuario = await UsuarioRepository.buscarPorId(usuarioId);
  if (!usuario || usuario.perfil !== "MORADOR") {
    throw new AppError("Morador não encontrado.", 404);
  }

  const { token, tokenHash } = gerarTokenConvite();
  const expiraEm = expiracaoConvite();

  await prisma.$transaction(async (tx) => {
    await ConviteRepository.invalidarPendentesDoUsuario(usuarioId, tx);
    await ConviteRepository.criar({ usuarioId, tokenHash, expiraEm }, tx);
  });

  return {
    morador: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    convite: { link: montarLinkConvite(token), expiraEm },
  };
}
}