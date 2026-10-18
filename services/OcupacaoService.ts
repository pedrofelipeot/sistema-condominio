import { AppError } from "@/errors/AppError";
import { fimDoDiaUTC, inicioDoDiaUTC } from "@/lib/date";
import { prisma, type Db } from "@/lib/prisma";
import type { Morador } from "@/lib/types";
import { CasaRepository } from "@/repositories/CasaRepository";
import { OcupacaoRepository } from "@/repositories/OcupacaoRepository";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";

export class OcupacaoService {
  /* ------------------------------------------------------------ */
  /* CONSULTAS                                                    */
  /* ------------------------------------------------------------ */

  private static paraMorador(ocupacao: {
    usuario: { id: number; nome: string; email: string };
    casaId: number;
    dataEntrada: Date;
    dataSaida: Date | null;
  }): Morador {
    return {
      id: ocupacao.usuario.id,
      nome: ocupacao.usuario.nome,
      email: ocupacao.usuario.email,
      casaId: ocupacao.casaId,
      ativo: ocupacao.dataSaida === null,
      dataEntrada: ocupacao.dataEntrada,
      dataSaida: ocupacao.dataSaida,
    };
  }

  static async listarPorCasa(casaId: number): Promise<Morador[]> {
    const ocupacoes = await OcupacaoRepository.listarPorCasa(casaId);
    return ocupacoes.map(OcupacaoService.paraMorador);
  }

  static listarPorMorador(usuarioId: number) {
    return OcupacaoRepository.listarPorMorador(usuarioId);
  }

  static async buscarMorador(usuarioId: number): Promise<Morador | undefined> {
    const ocupacao =
      await OcupacaoRepository.buscarMaisRecentePorMorador(usuarioId);
    return ocupacao ? OcupacaoService.paraMorador(ocupacao) : undefined;
  }

  /* ------------------------------------------------------------ */
  /* OPERAÇÕES COM REGRA                                           */
  /* Ordem: normalizar -> transação -> existência -> regras       */
  /* -> gravar -> retornar                                        */
  /* ------------------------------------------------------------ */

  static admitirMorador(usuarioId: number, casaId: number, dataEntrada: Date) {
    // A validação de formato já foi feita no Zod.
    const entrada = inicioDoDiaUTC(dataEntrada);

    // A ocupação e o status do usuário devem ser gravados juntos.
    return prisma.$transaction(async (tx) => {
      // Existência -> 404
      await OcupacaoService.exigirMorador(usuarioId, tx);
      await OcupacaoService.exigirCasa(casaId, tx);

      // Regras de negócio -> 409
      const moradorSobreposto =
        await OcupacaoRepository.buscarPeriodoSobreposto(usuarioId, entrada, tx);
      if (moradorSobreposto) {
        throw new AppError(
          "O período de residência do morador se sobrepõe a outro período.",
          409,
        );
      }

      // O service monta os dados persistidos, sem repassar o body.
      const ocupacao = await OcupacaoRepository.criar(
        { usuarioId, casaId, dataEntrada: entrada },
        tx,
      );
      await UsuarioRepository.atualizar(usuarioId, { ativo: true }, tx);

      return ocupacao;
    });
  }

  static encerrarMoradia(usuarioId: number, dataSaida: Date) {
    const saida = fimDoDiaUTC(dataSaida);

    return prisma.$transaction(async (tx) => {
      const ocupacao = await OcupacaoRepository.buscarOcupacaoAtiva(usuarioId, tx);
      if (!ocupacao) {
        throw new AppError("O morador não possui uma ocupação ativa.", 404);
      }

      if (saida < ocupacao.dataEntrada) {
        throw new AppError(
          "A data de saída não pode ser anterior à data de entrada.",
          400,
        );
      }

      const encerrada = await OcupacaoRepository.encerrar(ocupacao.id, saida, tx);
      await UsuarioRepository.atualizar(usuarioId, { ativo: false }, tx);

      return encerrada;
    });
  }

  /* ------------------------------------------------------------ */
  /* AUXILIARES PRIVADOS: "buscar ou lançar 404"                   */
  /* Recebem o db para funcionar dentro da transação               */
  /* ------------------------------------------------------------ */

  private static async exigirMorador(id: number, db: Db) {
    const usuario = await UsuarioRepository.buscarPorId(id, db);
    if (!usuario || usuario.perfil !== "MORADOR") {
      throw new AppError("Morador não encontrado.", 404);
    }
    return usuario;
  }

  private static async exigirCasa(id: number, db: Db) {
    const casa = await CasaRepository.buscarPorId(id, db);
    if (!casa) {
      throw new AppError("Casa não encontrada.", 404);
    }
    return casa;
  }
}