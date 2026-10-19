"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ErroApi } from "@/lib/api-cliente";
import {
  converterCasa,
  converterCobranca,
  converterMorador,
  type CobrancaApi,
  type MinhaCasaApi,
} from "@/lib/conversores";
import { formatarData, formatarMoeda } from "@/lib/format";
import { statusDaCobranca } from "@/lib/status";
import type { Aviso, Casa, Cobranca, Morador } from "@/lib/types";

type AvisoApi = Omit<Aviso, "createdAt"> & { createdAt: string };

export default function MoradorPage() {
  const [morador, setMorador] = useState<Morador | null>(null);
  const [casa, setCasa] = useState<Casa | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      api<MinhaCasaApi>("/api/morador/minha-casa"),
      api<CobrancaApi[]>("/api/morador/cobrancas"),
      api<AvisoApi[]>("/api/avisos"),
    ])
      .then(([minhaCasa, cobrancasApi, avisosApi]) => {
        if (cancelado) return;
        setMorador(converterMorador(minhaCasa));
        setCasa(converterCasa(minhaCasa.casa));
        setCobrancas(cobrancasApi.map(converterCobranca));
        setAvisos(
          avisosApi.map((aviso) => ({
            ...aviso,
            createdAt: new Date(aviso.createdAt),
          })),
        );
      })
      .catch((e: unknown) => {
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

  if (carregando) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm"
        >
          Carregando seu resumo...
        </div>
      </div>
    );
  }

  if (erro || !morador || !casa) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-800"
        >
          {erro ?? "Não foi possível carregar seus dados."}
        </div>
      </div>
    );
  }

  const cobrancasEmAberto = cobrancas
    .filter((cobranca) => cobranca.status === "PENDENTE")
    .sort((a, b) => a.vencimento.getTime() - b.vencimento.getTime());
  const proximaCobranca = cobrancasEmAberto[0];
  const avisoMaisRecente = avisos[0];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-10">
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
            Área do morador
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Olá, {morador.nome}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Este é o resumo da sua unidade. Você está na Casa {casa.numero}.
          </p>
        </div>
      </header>

      <section
        aria-label="Resumo da unidade"
        className="grid gap-4 md:grid-cols-2"
      >
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {proximaCobranca ? "Aluguel em aberto" : "Situação do aluguel"}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {proximaCobranca
                  ? formatarMoeda(proximaCobranca.valor)
                  : "Em dia"}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                proximaCobranca
                  ? statusDaCobranca(proximaCobranca) === "Em atraso"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-800"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {proximaCobranca
                ? statusDaCobranca(proximaCobranca)
                : "Nenhuma pendência"}
            </span>
          </div>
          {proximaCobranca ? (
            <p className="mt-3 text-sm text-slate-500">
              Vencimento em {formatarData(proximaCobranca.vencimento)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Não há cobranças pendentes registradas para sua unidade.
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">
            Situação das cobranças da Casa {casa.numero}.
          </p>
          <Link
            href="/morador/pagamentos"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/25"
          >
            Ver pagamentos
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </Link>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Aviso mais recente
            </span>
            {avisoMaisRecente && (
              <time
                dateTime={avisoMaisRecente.createdAt.toISOString()}
                className="text-sm text-slate-500"
              >
                {formatarData(avisoMaisRecente.createdAt)}
              </time>
            )}
          </div>
          {avisoMaisRecente ? (
            <>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                {avisoMaisRecente.titulo}
              </h2>
              <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                {avisoMaisRecente.texto}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                Nenhum aviso publicado
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Novos comunicados da administração aparecerão aqui.
              </p>
            </>
          )}
          <Link
            href="/morador/avisos"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/15"
          >
            Ver todos os avisos
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </Link>
        </article>
      </section>

      <section aria-labelledby="atalhos-titulo">
        <div className="mb-4">
          <h2
            id="atalhos-titulo"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Acesso rápido
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Acesse as principais áreas do portal.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/morador/pagamentos"
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/15"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100">
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
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-900">
                Pagamentos
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                Consulte cobranças e histórico
              </span>
            </span>
            <span aria-hidden="true" className="text-slate-400 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/morador/avisos"
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/15"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-100">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-900">Avisos</span>
              <span className="mt-1 block text-sm text-slate-500">
                Leia comunicados do condomínio
              </span>
            </span>
            <span aria-hidden="true" className="text-slate-400 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
