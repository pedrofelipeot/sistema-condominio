import bcrypt from "bcryptjs";
import { AppError } from "@/errors/AppError";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import type { LoginInput, TrocarSenhaInput } from "@/validators/schemas";

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
}