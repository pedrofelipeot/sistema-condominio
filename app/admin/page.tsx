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

const MESES = [
  ["01", "Janeiro"],
  ["02", "Fevereiro"],
  ["03", "Março"],
  ["04", "Abril"],
  ["05", "Maio"],
  ["06", "Junho"],
  ["07", "Julho"],
  ["08", "Agosto"],
  ["09", "Setembro"],
  ["10", "Outubro"],
  ["11", "Novembro"],
  ["12", "Dezembro"],
] as const;

export default function AdminPage() {
  const [casas, setCasas] = useState<Casa[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [ano, setAno] = useState("");
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
        const competenciaMaisRecente = disponiveis[0] ?? "";
        setAno(competenciaMaisRecente.slice(0, 4));
        setMes(competenciaMaisRecente.slice(5, 7));
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

  const anos = [...new Set(cobrancas.map((c) => c.competencia.slice(0, 4)))]
    .sort()
    .reverse();

  const cobrancasDoMes = cobrancas.filter(
    (c) => c.competencia === `${ano}-${mes}`,
  );

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
        <div className="mt-4 grid gap-3 sm:mt-0 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Ano
            <select
              value={ano}
              onChange={(event) => setAno(event.target.value)}
              disabled={carregando || anos.length === 0}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            >
              {anos.length === 0 ? (
                <option value="">
                  {carregando ? "Carregando anos..." : "Sem anos"}
                </option>
              ) : (
                anos.map((opcaoAno) => (
                  <option key={opcaoAno} value={opcaoAno}>
                    {opcaoAno}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Mês
            <select
              value={mes}
              onChange={(event) => setMes(event.target.value)}
              disabled={carregando || anos.length === 0}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            >
              {MESES.map(([numero, nome]) => (
                <option key={numero} value={numero}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
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