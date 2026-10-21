"use client";

import { useEffect, useState } from "react";
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

const COBRANCAS_POR_PAGINA = 12;
type FiltroStatusCobranca = "Todas" | "Paga" | "Pendente" | "Em atraso";

export default function CasaIdPage() {
  const { id } = useParams<{ id: string }>();
  return <DetalhesCasa key={id} id={id} />;
}

function DetalhesCasa({ id }: { id: string }) {
  const [casa, setCasa] = useState<Casa | null>(null);
  const [moradores, setMoradores] = useState<MoradorDaCasa[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<{ mensagem: string; status?: number } | null>(null);
  const [erroDesativacao, setErroDesativacao] = useState<string | null>(null);
  const [desativandoMoradorId, setDesativandoMoradorId] = useState<number | null>(null);
  const [anoFiltro, setAnoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState<FiltroStatusCobranca>("Todas");
  const [paginaCobrancas, setPaginaCobrancas] = useState(1);
  const [cobrancaParaPagar, setCobrancaParaPagar] = useState<Cobranca | null>(null);

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

  async function desativarMorador(morador: MoradorDaCasa) {
    const dataSaida = new Date().toLocaleDateString("sv-SE", {
      timeZone: "America/Sao_Paulo",
    });
    const confirmar = window.confirm(
      `Desativar ${morador.nome}? A ocupação será encerrada com data de saída de hoje, o acesso ao sistema será removido e o histórico da casa será mantido.`,
    );
    if (!confirmar) return;

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
    }
  }

  if (carregando) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm"
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
          className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-800"
        >
          {erro?.status === 404
            ? "Casa não encontrada."
            : (erro?.mensagem ?? "Casa não encontrada.")}
        </div>
        <Link
          href="/admin/casas"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          Voltar para casas
        </Link>
      </div>
    );
  }

  const ocupada = moradores.some((morador) => morador.ativo);
  const moradoresAtivos = moradores.filter((morador) => morador.ativo).length;
  const anosCobrancas = [...new Set(cobrancas.map((cobranca) => cobranca.competencia.slice(0, 4)))]
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
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl"
        />
        <div className="relative">
          <Link
            href="/admin/casas"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/30"
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
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
          <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Detalhes da unidade
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Casa {casa.numero}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                Informações da unidade, moradores e cobranças do condomínio.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold ${
                ocupada
                  ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
                  : "border-slate-300/20 bg-white/[0.06] text-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  ocupada ? "bg-emerald-400" : "bg-slate-400"
                }`}
              />
              {ocupada ? "Ocupada" : "Vazia"}
            </span>
          </div>
        </div>
      </header>

      <section aria-label="Resumo da unidade" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Quartos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {casa.quartos}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {casa.quartos === 1 ? "quarto na unidade" : "quartos na unidade"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Aluguel mensal</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {formatarMoeda(casa.valorAluguel)}
          </p>
          <p className="mt-1 text-sm text-slate-500">valor previsto da unidade</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Vencimento</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Dia {casa.diaVencimento}
          </p>
          <p className="mt-1 text-sm text-slate-500">vencimento mensal</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Moradores ativos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {moradoresAtivos}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {moradores.length} {moradores.length === 1 ? "cadastro" : "cadastros"} no total
          </p>
        </div>
      </section>

      <section aria-labelledby="moradores-titulo">
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2
        id="moradores-titulo"
        className="text-xl font-semibold tracking-tight text-slate-900"
      >
        Moradores
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Pessoas vinculadas a esta unidade e situação de ocupação.
      </p>
    </div>

    <div className="flex items-center gap-3">
      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
        {moradores.length} {moradores.length === 1 ? "morador" : "moradores"}
      </span>
      <Link
        href={`/admin/casas/${id}/cadastro-morador`}
        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
      >
        Cadastrar morador
      </Link>
    </div>
  </div>

  {erroDesativacao && (
    <p
      role="alert"
      className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
    >
      {erroDesativacao}
    </p>
  )}

  {moradores.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-slate-900">
        Nenhum morador cadastrado
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Os moradores vinculados a esta casa aparecerão aqui.
      </p>
    </div>
  ) : (
    <ul className="grid gap-4 lg:grid-cols-2">
      {moradores.map((morador) => (
        <li
          key={morador.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{morador.nome}</h3>
              <p className="mt-1 break-all text-sm text-slate-500">{morador.email}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                morador.ativo
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {morador.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <dt className="text-xs font-medium text-slate-500">Data de entrada</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {formatarData(new Date(morador.dataEntrada))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Data de saída</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {morador.dataSaida ? formatarData(new Date(morador.dataSaida)) : "-"}
              </dd>
            </div>
          </dl>
          {morador.ativo && (
            <button
              type="button"
              onClick={() => void desativarMorador(morador)}
              disabled={desativandoMoradorId !== null}
              className="mt-5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-600/15 disabled:cursor-wait disabled:opacity-60"
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
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="cobrancas-titulo"
              className="text-xl font-semibold tracking-tight text-slate-900"
            >
              Cobranças
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Histórico de cobranças da Casa {casa.numero}, das mais recentes às mais antigas.
            </p>
          </div>
          {cobrancas.length > 0 && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm font-medium text-slate-700">
                Ano
                <select
                  value={anoFiltro}
                  onChange={(event) => {
                    setAnoFiltro(event.target.value);
                    setPaginaCobrancas(1);
                  }}
                  className="mt-1 block min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
                >
                  <option value="todos">Todos</option>
                  {anosCobrancas.map((ano) => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Status
                <select
                  value={statusFiltro}
                  onChange={(event) => {
                    setStatusFiltro(event.target.value as FiltroStatusCobranca);
                    setPaginaCobrancas(1);
                  }}
                  className="mt-1 block min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
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

        {cobrancas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              Nenhuma cobrança cadastrada
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              As cobranças desta casa aparecerão aqui.
            </p>
          </div>
        ) : cobrancasFiltradas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-600">
              Nenhuma cobrança encontrada com os filtros selecionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setAnoFiltro("todos");
                setStatusFiltro("Todas");
                setPaginaCobrancas(1);
              }}
              className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Competência</th>
                    <th scope="col" className="px-5 py-3.5">Valor</th>
                    <th scope="col" className="px-5 py-3.5">Vencimento</th>
                    <th scope="col" className="px-5 py-3.5">Pagamento</th>
                    <th scope="col" className="px-5 py-3.5">Forma</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cobrancasVisiveis.map((cobranca) => {
                    const status = statusDaCobranca(cobranca);
                    const statusClass =
                      status === "Paga"
                        ? "bg-emerald-50 text-emerald-700"
                        : status === "Em atraso"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700";

                    return (
                      <tr key={cobranca.id} className="hover:bg-slate-50/80">
                        <th scope="row" className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-900">
                          {new Date(`${cobranca.competencia}-01T00:00:00.000Z`).toLocaleDateString(
                            "pt-BR",
                            { month: "long", year: "numeric", timeZone: "UTC" },
                          )}
                        </th>
                        <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-700">
                          {formatarMoeda(cobranca.valor)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                          {formatarData(cobranca.vencimento)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                          {formatarData(cobranca.pagoEm)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                          {cobranca.formaPagamento ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                            {status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          {cobranca.status !== "PAGA" ? (
                            <button
                              type="button"
                              onClick={() => setCobrancaParaPagar(cobranca)}
                              className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
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
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
              <p aria-live="polite" className="text-sm text-slate-600">
                Exibindo {primeiraCobrancaVisivel}–{ultimaCobrancaVisivel} de{" "}
                {cobrancasFiltradas.length}{" "}
                {cobrancasFiltradas.length === 1 ? "cobrança" : "cobranças"}
              </p>
              {totalPaginas > 1 && (
                <nav aria-label="Paginação do histórico de cobranças" className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaginaCobrancas((pagina) => Math.max(1, pagina - 1))}
                    disabled={paginaAtual === 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-slate-600">
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaginaCobrancas((pagina) => Math.min(totalPaginas, pagina + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </nav>
              )}
            </div>
          </div>
        )}
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
    </div>
  );
}
