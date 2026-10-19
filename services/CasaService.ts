import { AppError } from "@/errors/AppError";
import { exigirAdmin, type Solicitante } from "@/lib/sessao";
import { CasaRepository } from "@/repositories/CasaRepository";
import { OcupacaoRepository } from "@/repositories/OcupacaoRepository";
import type { AtualizarCasaInput } from "@/validators/schemas";

export class CasaService {
  static listar() {
    return CasaRepository.listar();
  }

  // Casas com a lista de moradores atuais (uma consulta para todas as casas)
  static async listarComMoradores(solicitante: Solicitante) {
    exigirAdmin(solicitante);

    const [casas, ocupacoes] = await Promise.all([
      CasaRepository.listar(),
      OcupacaoRepository.listarAtuais(),
    ]);

    return casas.map((casa) => ({
      ...casa,
      moradores: ocupacoes
        .filter((o) => o.casaId === casa.id)
        .map((o) => ({
          id: o.usuario.id,
          nome: o.usuario.nome,
          email: o.usuario.email,
          dataEntrada: o.dataEntrada,
        })),
    }));
  }

  static async buscarPorId(id: number) {
    const casa = await CasaRepository.buscarPorId(id);
    if (!casa) throw new AppError("Casa não encontrada.", 404);

    return casa;
  }

  static async editarCasa(
    id: number,
    casa: AtualizarCasaInput,
    solicitante: Solicitante,
  ) {
    // 1. Permissão -> 403
    exigirAdmin(solicitante);

    // 2. Existência -> 404
    await CasaService.buscarPorId(id);

    // 3. Regra: o número é único e não pode ser de outra casa -> 409
    if (casa.numero !== undefined) {
      const existente = await CasaRepository.buscarPorNumero(casa.numero);
      if (existente && existente.id !== id) {
        throw new AppError("Já existe uma casa com esse número.", 409);
      }
    }

    // 4. Gravar, montando o objeto campo por campo
    return CasaRepository.atualizar(id, {
      numero: casa.numero,
      quartos: casa.quartos,
      valorAluguel: casa.valorAluguel,
      diaVencimento: casa.diaVencimento,
    });
  }
}