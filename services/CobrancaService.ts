import { AppError } from "@/errors/AppError";
import { exigirAdmin, type Solicitante } from "@/lib/sessao";
import { prisma } from "@/lib/prisma";
import { CasaRepository } from "@/repositories/CasaRepository";
import { CobrancaRepository } from "@/repositories/CobrancaRepository";
import { OcupacaoRepository } from "@/repositories/OcupacaoRepository";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import type {
  GerarCobrancasInput,
  PagamentoInput,
} from "@/validators/schemas";

export class CobrancaService {
  /* ------------------------------------------------------------ */
  /* CONSULTAS                                                     */
  /* ------------------------------------------------------------ */

  // Admin: histórico completo
  static listar(solicitante: Solicitante) {
    exigirAdmin(solicitante);
    return CobrancaRepository.listarTodas();
  }

  // Morador: só as cobranças que venceram durante os períodos em que ele morou
  static async listarDoMorador(solicitante: Solicitante) {
    const usuario = await UsuarioRepository.buscarPorId(solicitante.id);
    if (!usuario || usuario.perfil !== "MORADOR" || !usuario.ativo) {
      return [];
    }

    const ocupacoes = await OcupacaoRepository.listarPorMorador(solicitante.id);

    return CobrancaRepository.listarPorPeriodos(
      ocupacoes.map(({ casaId, dataEntrada, dataSaida }) => ({
        casaId,
        dataEntrada,
        dataSaida,
      })),
    );
  }

  /* ------------------------------------------------------------ */
  /* OPERAÇÕES COM REGRA                                           */
  /* ------------------------------------------------------------ */

  static async gerarCobrancas(
    dados: GerarCobrancasInput,
    solicitante: Solicitante,
  ) {
    // 1. Permissão -> 403
    exigirAdmin(solicitante);

    // 2. Montar o vencimento de cada casa a partir de "AAAA-MM"
    const [ano, mes] = dados.competencia.split("-").map(Number);

    const casas = await CasaRepository.listar();
    if (casas.length === 0) {
      throw new AppError("Não há casas cadastradas.", 404);
    }

    // 3. Transação: ou gera para todas as casas, ou para nenhuma
    return prisma.$transaction(async (tx) => {
      const cobrancas = [];

      for (const casa of casas) {
        const vencimento = new Date(
          Date.UTC(ano, mes - 1, casa.diaVencimento),
        );

        // criarSeNaoExistir evita duplicar (casa + competência é único)
        const cobranca = await CobrancaRepository.criarSeNaoExistir(
          {
            casaId: casa.id,
            competencia: dados.competencia,
            valor: casa.valorAluguel,
            vencimento,
            status: "PENDENTE", // use o valor real do seu enum
            pagoEm: null,
            formaPagamento: null,
          },
          tx,
        );

        cobrancas.push(cobranca);
      }

      return cobrancas;
    });
  }

  static async registrarPagamento(
    id: number,
    dados: PagamentoInput,
    solicitante: Solicitante,
  ) {
    exigirAdmin(solicitante);

    const cobranca = await CobrancaService.exigirCobranca(id); // 404

    // Regra: não pagar duas vezes -> 409
    if (cobranca.status === "PAGA") {
      throw new AppError("Esta cobrança já foi paga.", 409);
    }

    return CobrancaRepository.atualizar(id, {
      status: "PAGA",
      pagoEm: dados.pagoEm,
      formaPagamento: dados.formaPagamento,
    });
  }

  /* ------------------------------------------------------------ */
  /* AUXILIAR PRIVADO                                              */
  /* ------------------------------------------------------------ */

  private static async exigirCobranca(id: number) {
    const cobranca = await CobrancaRepository.buscarPorId(id);
    if (!cobranca) throw new AppError("Cobrança não encontrada.", 404);
    return cobranca;
  }
}