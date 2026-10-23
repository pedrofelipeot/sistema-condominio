"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
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
import { acaoSecundariaAzul } from "@/app/components/estilosAcoes";

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
          className="rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] px-6 py-12 text-center text-sm text-[var(--morador-text-secondary)]"
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
          className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 text-sm font-medium text-[var(--morador-danger)]"
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
  const totalEmAberto = cobrancasEmAberto.reduce(
    (total, cobranca) => total + cobranca.valor,
    0,
  );
  const avisosRecentes = [...avisos]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7 px-5 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Área do morador"
        title={`Olá, ${morador.nome}`}
        description="Acesse seus pagamentos e os comunicados do condomínio."
        badge={`Casa ${casa.numero}`}
      />

      <section aria-label="Acessos principais" className="grid gap-4 md:grid-cols-2">
        <Link
          href="/morador/pagamentos"
          className="group flex min-h-64 flex-col rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 shadow-sm transition-colors hover:border-link hover:bg-hover-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold tracking-tight text-[var(--morador-text-primary)]">
                Pagamentos
              </p>
              <p className="mt-1 text-base text-[var(--morador-text-secondary)]">
                Consulte suas cobranças e o histórico.
              </p>
            </div>
            <StatusBadge
              tone={
                !proximaCobranca
                  ? "success"
                  : statusDaCobranca(proximaCobranca) === "Em atraso"
                    ? "danger"
                    : "warning"
              }
            >
              {proximaCobranca
                ? statusDaCobranca(proximaCobranca)
                : "Nenhuma pendência"}
            </StatusBadge>
          </div>
          <div className="my-auto py-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--morador-text-secondary)]">
              {proximaCobranca ? "Próxima cobrança" : "Cobranças em aberto"}
            </p>
            <p
              className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${
                proximaCobranca
                  ? "text-[var(--morador-text-primary)]"
                  : "text-[var(--morador-success)]"
              }`}
            >
              {proximaCobranca ? formatarMoeda(proximaCobranca.valor) : "Em dia"}
            </p>
            {proximaCobranca ? (
              <p className="mt-3 text-base text-[var(--morador-text-secondary)]">
                Vencimento em {formatarData(proximaCobranca.vencimento)}
              </p>
            ) : (
              <p className="mt-3 text-base text-[var(--morador-text-secondary)]">
                Não há cobranças pendentes registradas para sua unidade.
              </p>
            )}
            <p className="mt-1 text-base tabular-nums text-[var(--morador-text-secondary)]">
              {cobrancasEmAberto.length > 0
                ? `${formatarMoeda(totalEmAberto)} no total em aberto`
                : `Aluguel mensal de ${formatarMoeda(casa.valorAluguel)}`}
            </p>
          </div>
          <span className={`${acaoSecundariaAzul} mt-2`}>
            Acessar pagamentos
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
          </span>
        </Link>

        <Link
          href="/morador/avisos"
          className="group flex min-h-64 flex-col rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 shadow-sm transition-colors hover:border-link hover:bg-hover-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold tracking-tight text-[var(--morador-text-primary)]">
                Avisos
              </p>
              <p className="mt-1 text-base text-[var(--morador-text-secondary)]">
                Acompanhe os comunicados do condomínio.
              </p>
            </div>
            <StatusBadge tone="neutral">
              {avisos.length} {avisos.length === 1 ? "aviso" : "avisos"}
            </StatusBadge>
          </div>
          {avisosRecentes.length > 0 ? (
            <ul className="my-auto divide-y divide-[var(--morador-border)] py-4">
              {avisosRecentes.map((aviso) => (
                <li key={aviso.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="font-semibold text-[var(--morador-text-primary)]">{aviso.titulo}</p>
                    <time
                      dateTime={aviso.createdAt.toISOString()}
                      className="text-xs text-[var(--morador-text-secondary)]"
                    >
                      {formatarData(aviso.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-base leading-6 text-[var(--morador-text-secondary)]">
                    {aviso.texto}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="my-auto py-6 text-base leading-6 text-[var(--morador-text-secondary)]">
              Nenhum aviso publicado. Novos comunicados da administração
              aparecerão aqui.
            </p>
          )}
          <span className={`${acaoSecundariaAzul} mt-2`}>
            Acessar avisos
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
          </span>
        </Link>
      </section>

      <section
        aria-label="Informações da unidade"
        className="rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 shadow-sm"
      >
        <dl className="grid divide-y divide-[var(--morador-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="py-4 sm:pr-6">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--morador-text-secondary)]">
              Aluguel mensal
            </dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-[var(--morador-text-primary)]">
              {formatarMoeda(casa.valorAluguel)}
            </dd>
          </div>
          <div className="py-4 sm:pl-6">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--morador-text-secondary)]">
              Vencimento mensal
            </dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-[var(--morador-text-primary)]">
              Todo dia {casa.diaVencimento}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
