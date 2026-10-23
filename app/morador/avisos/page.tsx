"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ErroApi } from "@/lib/api-cliente";
import { formatarData } from "@/lib/format";
import type { Aviso } from "@/lib/types";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
import { acaoSecundaria } from "@/app/components/estilosAcoes";

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
    <div className="mx-auto w-full max-w-4xl space-y-6 px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/morador"
        className={acaoSecundaria}
      >
        <span aria-hidden="true">←</span>
        Voltar ao início
      </Link>
      <PageHeader
        eyebrow="Mural do condomínio"
        title="Avisos"
        description="Novidades, orientações e informações compartilhadas pela administração."
        badge={
          !carregando && !erro
            ? `${avisos.length} ${avisos.length === 1 ? "comunicado" : "comunicados"}`
            : undefined
        }
      />

      {carregando ? (
        <div
          role="status"
          className="rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] px-6 py-12 text-center text-sm text-[var(--morador-text-secondary)]"
        >
          Carregando os avisos...
        </div>
      ) : erro ? (
        <div
          role="alert"
          className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 text-sm font-medium text-[var(--morador-danger)]"
        >
          {erro}
        </div>
      ) : (
      <section aria-label="Comunicados do condomínio">
        {avisos.length === 0 ? (
          <div className="rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 text-center shadow-sm">
            <h2 className="text-base font-semibold text-[var(--morador-text-primary)]">
              Nenhum aviso publicado
            </h2>
            <p className="mt-2 text-base text-[var(--morador-text-secondary)]">
              Não há comunicados no momento. Novidades aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {avisoMaisRecente && (
              <article className="rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusBadge tone="neutral">
                    Mais recente
                  </StatusBadge>
                  <time
                    dateTime={avisoMaisRecente.createdAt.toISOString()}
                    className="text-sm text-[var(--morador-text-secondary)]"
                  >
                    {formatarData(avisoMaisRecente.createdAt)}
                  </time>
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-[var(--morador-text-primary)]">
                  {avisoMaisRecente.titulo}
                </h2>
                <p className="mt-2 whitespace-pre-line text-base leading-6 text-[var(--morador-text-secondary)]">
                  {avisoMaisRecente.texto}
                </p>
              </article>
            )}

            {avisosAnteriores.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-[var(--morador-text-primary)]">
                  Comunicados anteriores
                </h2>
                <ul className="divide-y divide-[var(--morador-border)] rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 shadow-sm">
                  {avisosAnteriores.map((aviso) => (
                    <li key={aviso.id} className="py-4 first:pt-4 last:pb-4">
                      <article>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="font-semibold tracking-tight text-[var(--morador-text-primary)]">
                            {aviso.titulo}
                          </h3>
                          <time
                            dateTime={aviso.createdAt.toISOString()}
                            className="text-sm text-[var(--morador-text-secondary)]"
                          >
                            {formatarData(aviso.createdAt)}
                          </time>
                        </div>
                        <p className="mt-1 whitespace-pre-line text-base leading-6 text-[var(--morador-text-secondary)]">
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
