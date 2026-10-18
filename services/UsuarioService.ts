import bcrypt from "bcryptjs"; // ou "bcrypt", conforme o que você instalou
import { AppError } from "@/errors/AppError";
import { exigirAdmin, type Solicitante } from "@/lib/sessao";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import type {
  AtualizarUsuarioInput,
  FiltrarMoradoresInput,
  NovoAdminInput,
  RedefinirSenhaInput,
} from "@/validators/schemas";

const CUSTO_HASH = 10;

export class UsuarioService {
  /* ------------------------------------------------------------ */
  /* CONSULTAS                                                     */
  /* ------------------------------------------------------------ */

  static listarMoradores(filtros: FiltrarMoradoresInput, solicitante: Solicitante) {
    exigirAdmin(solicitante);

    return UsuarioRepository.listarMoradores({
      busca: filtros.busca,
      ativo: filtros.ativo,
    });
  }

  static async buscarPorId(id: number, solicitante: Solicitante) {
    UsuarioService.exigirAdminOuProprio(id, solicitante);
    return UsuarioService.exigirUsuario(id);
  }

  /* ------------------------------------------------------------ */
  /* OPERAÇÕES COM REGRA                                           */
  /* ------------------------------------------------------------ */

  static async criarAdmin(dados: NovoAdminInput, solicitante: Solicitante) {
    // 1. Permissão -> 403
    exigirAdmin(solicitante);

    // 2. E-mail único -> 409
    const existente = await UsuarioRepository.buscarPorEmail(dados.email);
    if (existente) throw new AppError("E-mail já cadastrado.", 409);

    // 3. O service define perfil e demais campos, nunca o cliente
    const senhaHash = await bcrypt.hash(dados.senha, CUSTO_HASH);

    return UsuarioRepository.criar({
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      perfil: "ADMIN",
      ativo: true,
      precisaTrocarSenha: false,
    });
  }

  static async atualizar(
    id: number,
    dados: AtualizarUsuarioInput,
    solicitante: Solicitante,
  ) {
    // 1. Permissão: o próprio usuário ou um admin -> 403
    UsuarioService.exigirAdminOuProprio(id, solicitante);

    // 2. Existência -> 404
    await UsuarioService.exigirUsuario(id);

    // 3. E-mail novo não pode ser de outra pessoa -> 409
    if (dados.email !== undefined) {
      const existente = await UsuarioRepository.buscarPorEmail(dados.email);
      if (existente && existente.id !== id) {
        throw new AppError("E-mail já cadastrado.", 409);
      }
    }

    // 4. Gravar só os campos permitidos
    return UsuarioRepository.atualizar(id, {
      nome: dados.nome,
      email: dados.email,
    });
  }

  // Admin redefine a senha de um morador
  static async redefinirSenha(
    id: number,
    dados: RedefinirSenhaInput,
    solicitante: Solicitante,
  ) {
    exigirAdmin(solicitante);

    const usuario = await UsuarioService.exigirUsuario(id); // 404

    if (usuario.perfil !== "MORADOR") {
      throw new AppError("Só é possível redefinir a senha de moradores.", 403);
    }

    const senhaHash = await bcrypt.hash(dados.novaSenha, CUSTO_HASH);

    // senha provisória: o morador troca no próximo acesso
    await UsuarioRepository.atualizar(id, {
      senhaHash,
      precisaTrocarSenha: true,
    });
  }

  /* ------------------------------------------------------------ */
  /* AUXILIARES PRIVADOS                                           */
  /* ------------------------------------------------------------ */

  private static async exigirUsuario(id: number) {
    const usuario = await UsuarioRepository.buscarPorId(id);
    if (!usuario) throw new AppError("Usuário não encontrado.", 404);
    return usuario;
  }

  private static exigirAdminOuProprio(id: number, solicitante: Solicitante) {
    if (solicitante.perfil !== "ADMIN" && solicitante.id !== id) {
      throw new AppError("Sem permissão.", 403);
    }
  }
}