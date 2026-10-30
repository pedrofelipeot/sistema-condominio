"use client"

import { useState } from "react";
import { formatarData, formatarMoeda } from "@/lib/format";
import { statusDaCobranca } from "@/lib/status";
import type { Casa, Cobranca } from "@/lib/types";
import { acaoPillBase } from "./estilosAcoes";
import StatusBadge from "./StatusBadge";

type Props = { casas: Casa[]; cobrancas: Cobranca[] };
type FiltroStatus = "Paga" | "Em atraso" | "Pendente" | "Sem cobrança";

export default function PainelMensal({ casas, cobrancas }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus | null>(null);
  const linhas = casas.map((casa) => {
    const cobranca = cobrancas.find((item) => item.casaId === casa.id);
    return { casa, cobranca, status: statusDaCobranca(cobranca) };
  });
  const linhasFiltradas =
    filtroStatus === null
      ? linhas
      : linhas.filter((linha) => linha.status === filtroStatus);
  const pagas = linhas.filter((linha) => linha.status === "Paga").length;
  const emAtraso = linhas.filter((linha) => linha.status === "Em atraso").length;
  const pendentes = linhas.filter((linha) => linha.status === "Pendente").length;
  const semCobranca = linhas.filter(
    (linha) => linha.status === "Sem cobrança",
  ).length;

  const indicadores = [
    {
      rotulo: "Pagas",
      total: pagas,
      detalhe: "cobranças recebidas",
      cor: "bg-emerald-500",
      fundo: "bg-emerald-50",
      texto: "text-emerald-700",
    },
    {
      rotulo: "Em atraso",
      total: emAtraso,
      detalhe: "precisam de atenção",
      cor: "bg-rose-500",
      fundo: "bg-rose-50",
      texto: "text-rose-700",
    },
    {
      rotulo: "Pendentes",
      total: pendentes,
      detalhe: "ainda no prazo",
      cor: "bg-amber-500",
      fundo: "bg-amber-50",
      texto: "text-amber-700",
    },
    {
      rotulo: "Sem cobrança",
      total: semCobranca,
      detalhe: "sem lançamento no mês",
      cor: "bg-slate-400",
      fundo: "bg-slate-100",
      texto: "text-slate-700",
    },
  ];

  function tomStatus(status: string) {
    if (status === "Paga") return "success" as const;
    if (status === "Em atraso") return "danger" as const;
    if (status === "Pendente") return "warning" as const;
    return "neutral" as const;
  }

  return (
    <div className="space-y-6">
      <section
        aria-label="Indicadores de cobranças"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {indicadores.map((indicador) => (
          <article
            key={indicador.rotulo}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {indicador.rotulo}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
                  {indicador.total}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2 w-2 rounded-full ${indicador.cor}`}
              />
            </div>
            <p className="mt-1 text-base text-slate-600">{indicador.detalhe}</p>
          </article>
        ))}
      </section>

      <section
        aria-labelledby="detalhamento-casas-titulo"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="detalhamento-casas-titulo"
              className="text-lg font-semibold tracking-tight text-slate-950"
            >
              Cobranças por unidade
            </h2>
            <p className="mt-1 text-base text-slate-600">
              Situação de cada casa na competência selecionada.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              aria-label="Filtrar unidades por status"
              className="flex flex-wrap gap-2"
              role="group"
            >
              {(
                [
                  { status: null, rotulo: "Todas" },
                  { status: "Paga", rotulo: "Pagas" },
                  { status: "Em atraso", rotulo: "Em atraso" },
                  { status: "Pendente", rotulo: "Pendentes" },
                  { status: "Sem cobrança", rotulo: "Casas vazias" },
                ] as const
              ).map(({ status, rotulo }) => (
                <button
                  key={status ?? "todas"}
                  type="button"
                  aria-pressed={filtroStatus === status}
                  onClick={() =>
                    setFiltroStatus(
                      status !== null && filtroStatus === status ? null : status,
                    )
                  }
                  className={`${acaoPillBase} ${
                    filtroStatus === status
                      ? "border-primary bg-primary text-white hover:bg-primary-hover"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            <span
              aria-live="polite"
              className="self-start sm:self-auto"
            >
              <StatusBadge tone="neutral">
                {linhasFiltradas.length}{" "}
                {linhasFiltradas.length === 1 ? "unidade" : "unidades"}
              </StatusBadge>
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-200 md:hidden">
            {linhasFiltradas.map((linha) => (
              <li key={linha.casa.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      Casa {linha.casa.numero}
                    </p>
                    <p className="mt-1 text-sm capitalize text-slate-600">
                      {linha.cobranca
                        ? new Date(`${linha.cobranca.competencia}-01T00:00:00.000Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
                        : "Sem cobrança no mês selecionado"}
                    </p>
                  </div>
                  <StatusBadge tone={tomStatus(linha.status)}>
                    {linha.status}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                  {linha.cobranca ? formatarMoeda(linha.cobranca.valor) : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Vencimento: {linha.cobranca ? formatarData(linha.cobranca.vencimento) : "—"}
                </p>
              </li>
            ))}
            {linhasFiltradas.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-600">
                {casas.length === 0
                  ? "Nenhuma unidade cadastrada."
                  : "Nenhuma unidade encontrada com este status."}
              </li>
            )}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-base">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">Unidade</th>
                  <th scope="col" className="px-4 py-3 text-left">Quartos</th>
                  <th scope="col" className="px-4 py-3 text-left">Aluguel</th>
                  <th scope="col" className="px-4 py-3 text-left">Vencimento</th>
                  <th scope="col" className="px-4 py-3 text-left">Pagamento</th>
                  <th scope="col" className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {linhasFiltradas.map((linha) => (
                  <tr
                    key={linha.casa.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900"
                    >
                      Casa {linha.casa.numero}
                    </th>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      {linha.casa.quartos}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-800">
                      {formatarMoeda(linha.casa.valorAluguel)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      {linha.cobranca
                        ? formatarData(linha.cobranca.vencimento)
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      {linha.cobranca
                        ? formatarData(linha.cobranca.pagoEm)
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                      <StatusBadge tone={tomStatus(linha.status)}>
                        {linha.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
                {linhasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-slate-600"
                    >
                      {casas.length === 0
                        ? "Nenhuma unidade cadastrada."
                        : "Nenhuma unidade encontrada com este status."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}