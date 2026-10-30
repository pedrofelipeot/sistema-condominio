"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, ErroApi } from "@/lib/api-cliente";
import {
  converterCasa,
  converterCobranca,
  converterOcupacao,
  type CasaApi,
  type CobrancaApi,
  type MoradorDaCasa,
  type OcupacaoApi,
} from "@/lib/conversores";
import { formatarData, formatarMoeda } from "@/lib/format";
import { statusDaCobranca } from "@/lib/status";
import Link from "next/link";
import type { Casa, Cobranca } from "@/lib/types";
import RegistrarPagamentoModal from "@/app/components/admin/RegistrarPagamentoModal";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
import ModalConfirmacao from "@/app/components/ModalConfirmacao";

import {
  acaoPerigosa,
  acaoPrimaria,
  acaoSecundaria,
} from "@/app/components/estilosAcoes";
import {
  campoFormulario,
  rotuloCampo,
} from "@/app/components/estilosFormulario";

const COBRANCAS_POR_PAGINA = 12;
type FiltroStatusCobranca = "Todas" | "Paga" | "Pendente" | "Em atraso";

export default function CasaIdPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500"
        >
          Carregando os dados da casa...
        </div>
      }
    >
      <DetalhesCasaPage />
    </Suspense>
  );
}

function DetalhesCasaPage() {
  const { id } = useParams<{ id: string }>();
  return <DetalhesCasa key={id} id={id} />;
}

function DetalhesCasa({ id }: { id: string }) {
  const [casa, setCasa] = useState<Casa | null>(null);
  const [moradores, setMoradores] = useState<MoradorDaCasa[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<{
    mensagem: string;
    status?: number;
  } | null>(null);
  const [erroDesativacao, setErroDesativacao] = useState<string | null>(null);
  const [desativandoMoradorId, setDesativandoMoradorId] = useState<
    number | null
  >(null);
  const [anoFiltro, setAnoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] =
    useState<FiltroStatusCobranca>("Todas");
  const [paginaCobrancas, setPaginaCobrancas] = useState(1);
  const [cobrancaParaPagar, setCobrancaParaPagar] = useState<Cobranca | null>(
    null,
  );
  const [moradorParaDesativar, setMoradorParaDesativar] =
    useState<MoradorDaCasa | null>(null);

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      api<CasaApi>(`/api/casas/${id}`),
      api<OcupacaoApi[]>(`/api/casas/${id}/ocupacoes`),
      api<CobrancaApi[]>(`/api/casas/${id}/cobrancas`),
    ])
      .then(([casaApi, ocupacoesApi, cobrancasApi]) => {
        if (cancelado) return;
        setCasa(converterCasa(casaApi));
        setMoradores(ocupacoesApi.map(converterOcupacao));
        setCobrancas(cobrancasApi.map(converterCobranca));
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        setErro(
          e instanceof ErroApi
            ? { mensagem: e.message, status: e.status }
            : { mensagem: "Erro inesperado. Tente novamente." },
        );
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  async function confirmarDesativacao() {
    if (!moradorParaDesativar) return;
    const morador = moradorParaDesativar;

    const dataSaida = new Date().toLocaleDateString("sv-SE", {
      timeZone: "America/Sao_Paulo",
    });

    setErroDesativacao(null);
    setDesativandoMoradorId(morador.usuarioId);
    try {
      const ocupacao = await api<{ id: number; dataSaida: string }>(
        `/api/morador/${morador.usuarioId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ dataSaida }),
        },
      );
      setMoradores((atuais) =>
        atuais.map((item) =>
          item.id === ocupacao.id
            ? { ...item, ativo: false, dataSaida: new Date(ocupacao.dataSaida) }
            : item,
        ),
      );
    } catch (error) {
      setErroDesativacao(
        error instanceof ErroApi
          ? error.message
          : "Não foi possível desativar o morador. Tente novamente.",
      );
    } finally {
      setDesativandoMoradorId(null);
      setMoradorParaDesativar(null); // fecha o modal em qualquer caso
    }
  }

  if (carregando) {
    return (
      <div
        role="status"
        className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500"
      >
        Carregando os dados da casa...
      </div>
    );
  }

  if (erro || !casa) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-800"
        >
          {erro?.status === 404
            ? "Casa não encontrada."
            : (erro?.mensagem ?? "Casa não encontrada.")}
        </div>
        <Link href="/admin/casas" className={acaoSecundaria}>
          Voltar para casas
        </Link>
      </div>
    );
  }

  const ocupada = moradores.some((morador) => morador.ativo);
  const moradoresAtivos = moradores.filter((morador) => morador.ativo).length;
  const anosCobrancas = [
    ...new Set(cobrancas.map((cobranca) => cobranca.competencia.slice(0, 4))),
  ]
    .sort()
    .reverse();
  const cobrancasFiltradas = cobrancas.filter((cobranca) => {
    const anoCorresponde =
      anoFiltro === "todos" || cobranca.competencia.startsWith(`${anoFiltro}-`);
    const statusCorresponde =
      statusFiltro === "Todas" || statusDaCobranca(cobranca) === statusFiltro;
    return anoCorresponde && statusCorresponde;
  });
  const totalPaginas = Math.max(
    1,
    Math.ceil(cobrancasFiltradas.length / COBRANCAS_POR_PAGINA),
  );
  const paginaAtual = Math.min(paginaCobrancas, totalPaginas);
  const cobrancasVisiveis = cobrancasFiltradas.slice(
    (paginaAtual - 1) * COBRANCAS_POR_PAGINA,
    paginaAtual * COBRANCAS_POR_PAGINA,
  );
  const primeiraCobrancaVisivel =
    cobrancasFiltradas.length === 0
      ? 0
      : (paginaAtual - 1) * COBRANCAS_POR_PAGINA + 1;
  const ultimaCobrancaVisivel = Math.min(
    paginaAtual * COBRANCAS_POR_PAGINA,
    cobrancasFiltradas.length,
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        eyebrow="Detalhes da unidade"
        title={`Casa ${casa.numero}`}
        description="Informações da unidade, moradores e cobranças do condomínio."
        badge={ocupada ? "Ocupada" : "Vazia"}
        action={
          <Link href="/admin/casas" className={acaoSecundaria}>
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M16 10H4m5 5-5-5 5-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
            Voltar para casas
          </Link>
        }
      />

      <section
        aria-labelledby="informacoes-unidade-titulo"
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6"
      >
        <h2
          id="informacoes-unidade-titulo"
          className="text-lg font-semibold text-slate-950"
        >
          Informações da unidade
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Quartos
            </dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              {casa.quartos} {casa.quartos === 1 ? "quarto" : "quartos"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Aluguel mensal
            </dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-slate-900">
              {formatarMoeda(casa.valorAluguel)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Vencimento
            </dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Dia {casa.diaVencimento}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Moradores ativos
            </dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              {moradoresAtivos}
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({moradores.length}{" "}
                {moradores.length === 1 ? "cadastro" : "cadastros"} no total)
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="moradores-titulo">
        <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="moradores-titulo"
              className="text-xl font-semibold tracking-tight text-slate-950"
            >
              Moradores
            </h2>
            <p className="mt-1 text-base text-slate-600">
              Pessoas vinculadas a esta unidade e situação de ocupação.
            </p>
          </div>
          <Link
            href={`/admin/casas/${id}/cadastro-morador`}
            className={`${acaoPrimaria} w-full sm:w-auto`}
          >
            Cadastrar morador
          </Link>
        </div>

        {erroDesativacao && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
          >
            {erroDesativacao}
          </p>
        )}

        {moradores.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm md:p-6">
            <h3 className="text-base font-semibold text-slate-900">
              Nenhum morador cadastrado
            </h3>
            <p className="mt-2 text-base text-slate-600">
              Os moradores vinculados a esta casa aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {moradores.map((morador) => (
              <li
                key={morador.id}
                className="flex flex-col gap-3 py-3 md:gap-4 md:py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {morador.nome}
                    </h3>
                    <StatusBadge tone={morador.ativo ? "success" : "neutral"}>
                      {morador.ativo ? "Ativo" : "Inativo"}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {morador.email}
                  </p>
                </div>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2 md:min-w-[18rem]">
                  <div>
                    <dt className="text-slate-500">Data de entrada</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">
                      {formatarData(new Date(morador.dataEntrada))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Data de saída</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">
                      {morador.dataSaida
                        ? formatarData(new Date(morador.dataSaida))
                        : "—"}
                    </dd>
                  </div>
                </dl>
                {morador.ativo && (
                  <button
                    type="button"
                    onClick={() => setMoradorParaDesativar(morador)}
                    disabled={desativandoMoradorId !== null}
                    className={`${acaoPerigosa} self-start lg:self-auto`}
                  >
                    {desativandoMoradorId === morador.usuarioId
                      ? "Desativando..."
                      : "Desativar morador"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="cobrancas-titulo">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="cobrancas-titulo"
              className="text-xl font-semibold tracking-tight text-slate-950"
            >
              Cobranças
            </h2>
            <p className="mt-1 text-base text-slate-600">
              Histórico de cobranças da Casa {casa.numero}, das mais recentes às
              mais antigas.
            </p>
          </div>
          {cobrancas.length > 0 && (
            <div className="grid gap-3 md:flex md:flex-wrap md:items-end">
              <label className={`${rotuloCampo} min-w-36`}>
                Ano
                <select
                  value={anoFiltro}
                  onChange={(event) => {
                    setAnoFiltro(event.target.value);
                    setPaginaCobrancas(1);
                  }}
                  className={`${campoFormulario} mt-1.5 block`}
                >
                  <option value="todos">Todos</option>
                  {anosCobrancas.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${rotuloCampo} min-w-36`}>
                Status
                <select
                  value={statusFiltro}
                  onChange={(event) => {
                    setStatusFiltro(event.target.value as FiltroStatusCobranca);
                    setPaginaCobrancas(1);
                  }}
                  className={`${campoFormulario} mt-1.5 block`}
                >
                  <option value="Todas">Todos</option>
                  <option value="Paga">Paga</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em atraso">Em atraso</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-200 md:hidden">
            {cobrancasVisiveis.map((cobranca) => {
              const status = statusDaCobranca(cobranca);
              const tom: "success" | "danger" | "warning" =
                status === "Paga"
                  ? "success"
                  : status === "Em atraso"
                    ? "danger"
                    : "warning";
              const competencia = new Date(
                `${cobranca.competencia}-01T00:00:00.000Z`,
              ).toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              });

              return (
                <li key={cobranca.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold capitalize text-slate-900">
                        {competencia}
                      </p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                        {formatarMoeda(cobranca.valor)}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Vencimento: {formatarData(cobranca.vencimento)}
                      </p>
                    </div>
                    <StatusBadge tone={tom}>{status}</StatusBadge>
                  </div>
                  {cobranca.status !== "PAGA" && (
                    <button
                      type="button"
                      onClick={() => setCobrancaParaPagar(cobranca)}
                      className={`${acaoSecundaria} mt-3 w-full`}
                    >
                      Registrar pagamento
                    </button>
                  )}
                </li>
              );
            })}
            {cobrancasVisiveis.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-600">
                {cobrancas.length === 0
                  ? "Nenhuma cobrança cadastrada para esta casa."
                  : "Nenhuma cobrança encontrada com os filtros selecionados."}
                {cobrancas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnoFiltro("todos");
                      setStatusFiltro("Todas");
                      setPaginaCobrancas(1);
                    }}
                    className={`${acaoSecundaria} mt-3`}
                  >
                    Limpar filtros
                  </button>
                )}
              </li>
            )}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[920px] text-left text-base">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    Competência
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Valor
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Vencimento
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Pagamento
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Forma
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cobrancasVisiveis.map((cobranca) => {
                  const status = statusDaCobranca(cobranca);
                  const tom: "success" | "danger" | "warning" =
                    status === "Paga"
                      ? "success"
                      : status === "Em atraso"
                        ? "danger"
                        : "warning";

                  return (
                    <tr
                      key={cobranca.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900"
                      >
                        {new Date(
                          `${cobranca.competencia}-01T00:00:00.000Z`,
                        ).toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </th>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-800">
                        {formatarMoeda(cobranca.valor)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {formatarData(cobranca.vencimento)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {formatarData(cobranca.pagoEm)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {cobranca.formaPagamento ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        <StatusBadge tone={tom}>{status}</StatusBadge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {cobranca.status !== "PAGA" ? (
                          <button
                            type="button"
                            onClick={() => setCobrancaParaPagar(cobranca)}
                            className={acaoSecundaria}
                          >
                            Registrar Pagamento
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {cobrancasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-slate-600"
                    >
                      {cobrancas.length === 0 ? (
                        <>
                          <p className="font-semibold text-slate-900">
                            Nenhuma cobrança cadastrada
                          </p>
                          <p className="mt-2">
                            As cobranças desta casa aparecerão aqui.
                          </p>
                        </>
                      ) : (
                        <p>
                          Nenhuma cobrança encontrada com os filtros
                          selecionados.
                        </p>
                      )}
                      {cobrancas.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setAnoFiltro("todos");
                            setStatusFiltro("Todas");
                            setPaginaCobrancas(1);
                          }}
                          className={`${acaoSecundaria} mt-3`}
                        >
                          Limpar filtros
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {cobrancasFiltradas.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
              <p aria-live="polite" className="text-base text-slate-600">
                Exibindo {primeiraCobrancaVisivel}—“{ultimaCobrancaVisivel} de{" "}
                {cobrancasFiltradas.length}{" "}
                {cobrancasFiltradas.length === 1 ? "cobrança" : "cobranças"}
              </p>
              {totalPaginas > 1 && (
                <nav
                  aria-label="Paginação do histórico de cobranças"
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setPaginaCobrancas((pagina) => Math.max(1, pagina - 1))
                    }
                    disabled={paginaAtual === 1}
                    className={acaoSecundaria}
                  >
                    Anterior
                  </button>
                  <span className="text-base text-slate-600">
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPaginaCobrancas((pagina) =>
                        Math.min(totalPaginas, pagina + 1),
                      )
                    }
                    disabled={paginaAtual === totalPaginas}
                    className={acaoSecundaria}
                  >
                    Próxima
                  </button>
                </nav>
              )}
            </div>
          )}
        </div>
      </section>
      {cobrancaParaPagar && (
        <RegistrarPagamentoModal
          cobrancaId={cobrancaParaPagar.id}
          competencia={cobrancaParaPagar.competencia}
          onClose={() => setCobrancaParaPagar(null)}
          onSuccess={(cobrancaAtualizada) => {
            const convertida = converterCobranca(cobrancaAtualizada);
            setCobrancas((atuais) =>
              atuais.map((item) =>
                item.id === convertida.id ? convertida : item,
              ),
            );
            setCobrancaParaPagar(null);
          }}
        />
      )}
      <ModalConfirmacao
        aberto={moradorParaDesativar !== null}
        titulo="Desativar morador"
        descricao={`Desativar ${moradorParaDesativar?.nome ?? ""}? A ocupação será encerrada com data de saída de hoje, o acesso ao sistema será removido e o histórico da casa será mantido.`}
        textoConfirmar="Desativar"
        textoProcessando="Desativando..."
        processando={desativandoMoradorId !== null}
        onConfirmar={() => void confirmarDesativacao()}
        onCancelar={() => setMoradorParaDesativar(null)}
      />
    </div>
  );
}
