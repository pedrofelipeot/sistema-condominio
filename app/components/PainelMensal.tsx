"use client"

import { useState } from "react";
import { formatarData, formatarMoeda } from "@/lib/format";
import { statusDaCobranca } from "@/lib/status";
import type { Casa, Cobranca } from "@/lib/types";

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

  function classeStatus(status: string) {
    if (status === "Paga") return "bg-emerald-50 text-emerald-700";
    if (status === "Em atraso") return "bg-rose-50 text-rose-700";
    if (status === "Pendente") return "bg-amber-50 text-amber-700";
    return "bg-slate-100 text-slate-600";
  }

  return (
    <div className="space-y-8">
      <section aria-label="Indicadores de cobranças" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicadores.map((indicador) => (
          <article
            key={indicador.rotulo}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {indicador.rotulo}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  {indicador.total}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={`mt-1 h-2.5 w-2.5 rounded-full ${indicador.cor}`}
              />
            </div>
            <p className="mt-1 text-sm text-slate-500">{indicador.detalhe}</p>
          </article>
        ))}
      </section>

      <section
        aria-labelledby="detalhamento-casas-titulo"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <h2
              id="detalhamento-casas-titulo"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              Cobranças por unidade
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Situação de cada casa na competência selecionada.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 ${
                    filtroStatus === status
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            <span
              aria-live="polite"
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600"
            >
              {linhasFiltradas.length}{" "}
              {linhasFiltradas.length === 1 ? "unidade" : "unidades"}
            </span>
          </div>
        </div>

        {casas.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            Nenhuma unidade cadastrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Unidade</th>
                  <th scope="col" className="px-6 py-3.5">Quartos</th>
                  <th scope="col" className="px-6 py-3.5">Aluguel</th>
                  <th scope="col" className="px-6 py-3.5">Vencimento</th>
                  <th scope="col" className="px-6 py-3.5">Pagamento</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {linhasFiltradas.map((linha) => (
                  <tr
                    key={linha.casa.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900"
                    >
                      Casa {linha.casa.numero}
                    </th>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {linha.casa.quartos}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                      {formatarMoeda(linha.casa.valorAluguel)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {linha.cobranca
                        ? formatarData(linha.cobranca.vencimento)
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {linha.cobranca
                        ? formatarData(linha.cobranca.pagoEm)
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classeStatus(linha.status)}`}
                      >
                        {linha.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {linhasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      Nenhuma unidade encontrada com este status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}