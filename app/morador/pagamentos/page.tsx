"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PagamentosMorador from "@/app/components/PagamentosMorador";
import { api, ErroApi } from "@/lib/api-cliente";
import {
  converterCasa,
  converterCobranca,
  converterMorador,
  type CobrancaApi,
  type MinhaCasaApi,
} from "@/lib/conversores";
import type { ConfiguracaoPixApi } from "@/lib/pix";
import type { Casa, Cobranca, Morador } from "@/lib/types";
import { acaoSecundaria } from "@/app/components/estilosAcoes";

export default function PagamentosPage() {
  const [morador, setMorador] = useState<Morador | null>(null);
  const [casa, setCasa] = useState<Casa | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [pix, setPix] = useState<ConfiguracaoPixApi | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      api<MinhaCasaApi>("/api/morador/minha-casa"),
      api<CobrancaApi[]>("/api/morador/cobrancas"),
      api<ConfiguracaoPixApi>("/api/morador/pix"),
    ])
      .then(([minhaCasa, cobrancasApi, configuracaoPix]) => {
        if (cancelado) return;
        setMorador(converterMorador(minhaCasa));
        setCasa(converterCasa(minhaCasa.casa));
        setCobrancas(cobrancasApi.map(converterCobranca));
        setPix(configuracaoPix);
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
          Carregando seus pagamentos...
        </div>
      </div>
    );
  }

  if (erro || !morador || !casa || !pix) {
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

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/morador"
        className={`${acaoSecundaria} mb-5`}
      >
        <span aria-hidden="true">←</span>
        Voltar ao início
      </Link>
      <PagamentosMorador
        morador={morador}
        casa={casa}
        cobrancas={cobrancas}
        pix={pix}
      />
    </div>
  );
}