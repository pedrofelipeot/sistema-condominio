"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ErroApi } from "@/lib/api-cliente";
import { formatarData } from "@/lib/format";
import type { Aviso } from "@/lib/types";

type AvisoApi = Omit<Aviso, "createdAt"> & { createdAt: string };

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    api<AvisoApi[]>("/api/avisos")
      .then((dados) => {
        if (!cancelado) {
          setAvisos(
            dados.map((aviso) => ({
              ...aviso,
              createdAt: new Date(aviso.createdAt),
            })),
          );
        }
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

  const [avisoMaisRecente, ...avisosAnteriores] = avisos;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/morador"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
      >
        <span aria-hidden="true">←</span>
        Voltar ao início
      </Link>
      <header className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-7 py-9 sm:px-10 sm:py-11">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[28px] border-blue-100/60"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M15 7.5a5 5 0 0 0-10 0c0 5.8-2.5 5.8-2.5 7.5h15C17.5 13.3 15 13.3 15 7.5ZM8.3 17.5h3.4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            Mural do condomínio
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Comunicados para você
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Confira as novidades, orientações e informações compartilhadas
            pela administração.
          </p>
        </div>
      </header>

      {carregando ? (
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm"
        >
          Carregando os avisos...
        </div>
      ) : erro ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-800"
        >
          {erro}
        </div>
      ) : (
      <section aria-labelledby="avisos-morador-titulo">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="avisos-morador-titulo"
              className="text-xl font-semibold tracking-tight text-slate-900"
            >
              Mural de avisos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Comunicados em ordem do mais recente para o mais antigo.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            {avisos.length} {avisos.length === 1 ? "comunicado" : "comunicados"}
          </span>
        </div>

        {avisos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <svg
                aria-hidden="true"
                className="h-6 w-6"
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
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Tudo em dia
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Não há comunicados no momento. Novidades aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {avisoMaisRecente && (
              <article className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                <div className="h-1 bg-amber-400" />
                <div className="p-5 sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Mais recente
                    </span>
                    <time
                      dateTime={avisoMaisRecente.createdAt.toISOString()}
                      className="text-sm text-slate-500"
                    >
                      {formatarData(avisoMaisRecente.createdAt)}
                    </time>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    {avisoMaisRecente.titulo}
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                    {avisoMaisRecente.texto}
                  </p>
                </div>
              </article>
            )}

            {avisosAnteriores.length > 0 && (
              <div className="pt-3">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Comunicados anteriores
                </h3>
                <ul className="space-y-3">
                  {avisosAnteriores.map((aviso) => (
                    <li
                      key={aviso.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <article>
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                          <h4 className="font-semibold tracking-tight text-slate-900">
                            {aviso.titulo}
                          </h4>
                          <time
                            dateTime={aviso.createdAt.toISOString()}
                            className="text-sm text-slate-500"
                          >
                            {formatarData(aviso.createdAt)}
                          </time>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {aviso.texto}
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
      )}
    </div>
  );
}
