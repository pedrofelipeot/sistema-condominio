import { AppError } from "@/errors/AppError";
import { fimDoDiaUTC, inicioDoDiaUTC } from "@/lib/date";
import { prisma, type Db } from "@/lib/prisma";
import { exigirAdmin, type Solicitante } from "@/lib/sessao";
import type { Morador } from "@/lib/types";
import { CasaRepository } from "@/repositories/CasaRepository";
import { OcupacaoRepository } from "@/repositories/OcupacaoRepository";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import { ConviteRepository } from "@/repositories/ConviteRepository";
import { expiracaoConvite, gerarTokenConvite, montarLinkConvite } from "@/lib/convite";
import { hashSenhaInutilizavel } from "@/lib/senha";
import type { NovoMoradorInput } from "@/validators/schemas";

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

    static async listarComMoradores() {
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

  static async listarPorCasa(casaId: number, solicitante: Solicitante) {
  exigirAdmin(solicitante);

  const casa = await CasaRepository.buscarPorId(casaId);
  if (!casa) throw new AppError("Casa não encontrada.", 404);

  return OcupacaoRepository.listarPorCasa(casaId);
}

static async minhaOcupacao(solicitante: Solicitante) {
  if (solicitante.perfil !== "MORADOR") {
    throw new AppError("Apenas moradores possuem casa vinculada.", 403);
  }

  const ocupacao = await OcupacaoRepository.buscarOcupacaoAtiva(solicitante.id);
  if (!ocupacao) {
    throw new AppError("Você não possui uma ocupação ativa.", 404);
  }

  const [usuario, casa] = await Promise.all([
    UsuarioRepository.buscarPorId(solicitante.id),
    CasaRepository.buscarPorId(ocupacao.casaId),
  ]);

  if (!usuario || !casa) {
    throw new AppError("Dados da moradia não encontrados.", 404);
  }

  return {
    morador: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    casa,
    dataEntrada: ocupacao.dataEntrada,
  };
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

  static encerrarMoradia(
    usuarioId: number,
    dataSaida: Date,
    solicitante: Solicitante,
  ) {
    exigirAdmin(solicitante);
    const saida = fimDoDiaUTC(dataSaida);

    return prisma.$transaction(async (tx) => {
      await OcupacaoService.exigirMorador(usuarioId, tx);
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

  static async cadastrarMorador(dados: NovoMoradorInput, solicitante: Solicitante) {
  // 1. Permissão -> 403
  exigirAdmin(solicitante);

  // 2. Preparar o que não depende do banco
  const entrada = inicioDoDiaUTC(dados.dataEntrada);
  const senhaHash = await hashSenhaInutilizavel();
  const { token, tokenHash } = gerarTokenConvite();
  const expiraEm = expiracaoConvite();

  // 3. Usuário, ocupação e convite: tudo ou nada
  const usuario = await prisma.$transaction(async (tx) => {
    await OcupacaoService.exigirCasa(dados.casaId, tx); // 404

    const existente = await UsuarioRepository.buscarPorEmail(dados.email, tx);
    if (!existente) {
      const novo = await UsuarioRepository.criar(
        {
          nome: dados.nome,
          email: dados.email,
          senhaHash,
          perfil: "MORADOR",
          ativo: true,
          precisaTrocarSenha: false,
        },
        tx,
      );

      await OcupacaoRepository.criar(
        { usuarioId: novo.id, casaId: dados.casaId, dataEntrada: entrada },
        tx,
      );
      await ConviteRepository.criar(
        { usuarioId: novo.id, tokenHash, expiraEm },
        tx,
      );

      return novo;
    }

    if (existente.perfil !== "MORADOR" || existente.ativo) {
      throw new AppError("E-mail já cadastrado.", 409);
    }

    const ocupacaoAtiva = await OcupacaoRepository.buscarOcupacaoAtiva(
      existente.id,
      tx,
    );
    if (ocupacaoAtiva) {
      throw new AppError(
        "Este cadastro está inativo, mas ainda possui uma ocupação ativa.",
        409,
      );
    }

    const periodoSobreposto =
      await OcupacaoRepository.buscarPeriodoSobreposto(
        existente.id,
        entrada,
        tx,
      );
    if (periodoSobreposto) {
      throw new AppError(
        "O período de residência do morador se sobrepõe a outro período.",
        409,
      );
    }

    const reativado = await UsuarioRepository.atualizar(
      existente.id,
      {
        nome: dados.nome,
        ativo: true,
        senhaHash,
        precisaTrocarSenha: false,
      },
      tx,
    );

    await OcupacaoRepository.criar(
      {
        usuarioId: reativado.id,
        casaId: dados.casaId,
        dataEntrada: entrada,
      },
      tx,
    );
    await ConviteRepository.invalidarPendentesDoUsuario(reativado.id, tx);
    await ConviteRepository.criar(
      { usuarioId: reativado.id, tokenHash, expiraEm },
      tx,
    );

    return reativado;
  });

  // 4. O link só existe aqui, na resposta: o token puro não fica guardado
  return {
    morador: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    convite: { link: montarLinkConvite(token), expiraEm },
  };
}
}