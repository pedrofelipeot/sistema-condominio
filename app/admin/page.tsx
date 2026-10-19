"use client";

import { useEffect, useState } from "react";
import PainelMensal from "../components/PainelMensal";
import { api, ErroApi } from "@/lib/api-cliente";
import {
  converterCasa,
  converterCobranca,
  type CasaApi,
  type CobrancaApi,
} from "@/lib/conversores";
import type { Casa, Cobranca } from "@/lib/types";

export default function AdminPage() {
  const [casas, setCasas] = useState<Casa[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [mes, setMes] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      api<CasaApi[]>("/api/casas"),
      api<CobrancaApi[]>("/api/cobrancas"),
    ])
      .then(([casasApi, cobrancasApi]) => {
        if (cancelado) return;

        const cobrancasConvertidas = cobrancasApi.map(converterCobranca);
        setCasas(casasApi.map(converterCasa));
        setCobrancas(cobrancasConvertidas);

        // seleciona o mês mais recente que tenha cobranças
        const disponiveis = [
          ...new Set(cobrancasConvertidas.map((c) => c.competencia)),
        ]
          .sort()
          .reverse();
        setMes(disponiveis[0] ?? "");
      })
      .catch((e) => {
        if (cancelado) return;
        setErro(e instanceof ErroApi ? e.message : "Erro inesperado. Tente novamente.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const meses = [...new Set(cobrancas.map((c) => c.competencia))]
    .sort()
    .reverse();

  const cobrancasDoMes = cobrancas.filter((c) => c.competencia === mes);

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-11">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Visão geral
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Painel administrativo
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Acompanhe a situação das cobranças e consulte o resumo mensal das
            unidades do condomínio.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="resumo-mensal-titulo"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-end sm:justify-between sm:gap-6 sm:p-6"
      >
        <div>
          <h2
            id="resumo-mensal-titulo"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Resumo mensal
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Escolha uma competência para consultar as cobranças.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:w-64">
          <label
            htmlFor="mes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Competência
          </label>
          <select
            id="mes"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            disabled={carregando || meses.length === 0}
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          >
            {meses.length === 0 && (
              <option value="">
                {carregando ? "Carregando competências..." : "Sem competências"}
              </option>
            )}
            {meses.map((competencia) => (
              <option key={competencia} value={competencia}>
                {new Date(`${competencia}-01T00:00:00.000Z`).toLocaleDateString(
                  "pt-BR",
                  { month: "long", year: "numeric", timeZone: "UTC" },
                )}
              </option>
            ))}
          </select>
        </div>
      </section>

      {carregando ? (
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm"
        >
          Carregando o resumo das cobranças...
        </div>
      ) : erro ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-800"
        >
          {erro}
        </div>
      ) : (
        <PainelMensal casas={casas} cobrancas={cobrancasDoMes} />
      )}
    </div>
  );
}