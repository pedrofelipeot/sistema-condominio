import { AppError } from "@/errors/AppError";
import { exigirAdmin } from "@/lib/sessao";
import { AvisoRepository } from "@/repositories/AvisoRepository";
import type { AtualizarAvisoInput, AvisoInput, FiltrarAvisosInput } from "@/validators/schemas";

type Solicitante = { id: number; perfil: string };

export class AvisoService {
 

  static listarAvisos(filtros: FiltrarAvisosInput, solicitante: Solicitante) {
  if (!solicitante) {
    throw new AppError("Não autorizado.", 401);
  }
  return AvisoRepository.listar({ busca: filtros.busca });
}

  static async buscarPorId(id: number) {
    const aviso = await AvisoRepository.buscarPorId(id); // só busca
    if (!aviso) throw new AppError("Aviso não encontrado.", 404); // decide o erro
    return aviso;
  }

  static criarAviso(
    aviso: AvisoInput,
    solicitante: Solicitante,
  ) {
    exigirAdmin(solicitante);
    return AvisoRepository.criar({
      titulo: aviso.titulo,
      texto: aviso.texto,
      autorId: solicitante.id
    });
  }

  static async editarAviso(
    id: number,
    aviso: AtualizarAvisoInput,
    solicitante: Solicitante,
  ) {
    exigirAdmin(solicitante);

    await AvisoService.buscarPorId(id);

    return AvisoRepository.atualizar(id, {
      titulo: aviso.titulo,
      texto: aviso.texto,
    });
  }

  static async excluirAviso(id: number, solicitante: Solicitante) {
    exigirAdmin(solicitante);

    await AvisoService.buscarPorId(id);

    await AvisoRepository.excluir(id);
  }
}
