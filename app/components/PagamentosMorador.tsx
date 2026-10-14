"use client";

import { useState } from "react";
import { formatarData, formatarMoeda } from "@/app/lib/format";
import { statusDaCobranca } from "@/app/lib/status";
import type { Casa, Cobranca, Morador } from "@/app/lib/types";

type Props = {
  morador: Morador;
  casa: Casa;
  cobrancas: Cobranca[];
};

function formatarCompetencia(competencia: string) {
  const [ano, mes] = competencia.split("-");
  const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, 1));

  return data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function classeStatus(status: string) {
  if (status === "Paga") return "bg-emerald-50 text-emerald-700";
  if (status === "Em atraso") return "bg-rose-50 text-rose-700";
  if (status === "Pendente") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

export default function PagamentosMorador({
  morador,
  casa,
  cobrancas,
}: Props) {
  const meses = [...new Set(cobrancas.map((cobranca) => cobranca.competencia))]
    .sort()
    .reverse();
  const [mesSelecionado, setMesSelecionado] = useState(meses[0] ?? "");
  const cobrancasDoMes = cobrancas.filter(
    (cobranca) => cobranca.competencia === mesSelecionado,
  );
  const cobrancasEmAberto = cobrancas.filter(
    (cobranca) => cobranca.status === "PENDENTE",
  );
  const proximaCobranca = [...cobrancasEmAberto].sort(
    (a, b) => a.vencimento.getTime() - b.vencimento.getTime(),
  )[0];
  const totalEmAberto = cobrancasEmAberto.reduce(
    (total, cobranca) => total + cobranca.valor,
    0,
  );
  const statusAtual = proximaCobranca
    ? statusDaCobranca(proximaCobranca)
    : "Em dia";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-11">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Área financeira
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Pagamentos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Olá, {morador.nome}. Consulte a situação do aluguel e o histórico
            de cobranças da sua unidade.
          </p>
        </div>
      </header>

      <section
        aria-label="Resumo da situação financeira"
        className="grid gap-4 md:grid-cols-2"
      >
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {proximaCobranca ? "Valor em aberto" : "Situação atual"}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {proximaCobranca ? formatarMoeda(totalEmAberto) : statusAtual}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${classeStatus(statusAtual)}`}
            >
              {statusAtual}
            </span>
          </div>
          {proximaCobranca ? (
            <p className="mt-3 text-sm text-slate-500">
              {cobrancasEmAberto.length === 1
                ? "Cobrança com vencimento em "
                : `${cobrancasEmAberto.length} cobranças em aberto · vencimento mais próximo em `}
              {formatarData(proximaCobranca.vencimento)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Não há cobranças pendentes registradas para esta unidade.
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2v20m5-15H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </span>
            <div>
              <h2 className="font-semibold tracking-tight text-slate-900">
                Pagamento via Pix
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Para pagar via Pix, solicite a chave diretamente à
                administração. Confira a competência e informe a Casa{" "}
                {casa.numero} ao realizar o pagamento.
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                A chave Pix e o QR Code ainda não estão disponíveis nesta área.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section
        aria-labelledby="historico-pagamentos-titulo"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <h2
              id="historico-pagamentos-titulo"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              Histórico de pagamentos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulte cobranças, vencimentos e pagamentos registrados.
            </p>
          </div>
          <div className="sm:w-64">
            <label
              htmlFor="competencia"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Filtrar por mês
            </label>
            <select
              id="competencia"
              value={mesSelecionado}
              onChange={(event) => setMesSelecionado(event.target.value)}
              disabled={meses.length === 0}
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            >
              {meses.length === 0 ? (
                <option value="">Sem histórico</option>
              ) : (
                meses.map((mes) => (
                  <option key={mes} value={mes}>
                    {formatarCompetencia(mes)}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-blue-50/60 px-5 py-3.5 text-sm leading-6 text-blue-900 sm:px-6">
          As cobranças são vinculadas à unidade. O histórico abaixo corresponde
          à Casa {casa.numero}.
        </div>

        {cobrancas.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            Ainda não há cobranças registradas para esta unidade.
          </p>
        ) : cobrancasDoMes.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            Não há cobranças para o mês selecionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Competência</th>
                  <th scope="col" className="px-6 py-3.5">Valor</th>
                  <th scope="col" className="px-6 py-3.5">Vencimento</th>
                  <th scope="col" className="px-6 py-3.5">Pagamento</th>
                  <th scope="col" className="px-6 py-3.5">Forma</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cobrancasDoMes.map((cobranca) => {
                  const status = statusDaCobranca(cobranca);

                  return (
                    <tr
                      key={cobranca.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-semibold capitalize text-slate-900"
                      >
                        {formatarCompetencia(cobranca.competencia)}
                      </th>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                        {formatarMoeda(cobranca.valor)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatarData(cobranca.vencimento)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatarData(cobranca.pagoEm)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {cobranca.formaPagamento ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classeStatus(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
