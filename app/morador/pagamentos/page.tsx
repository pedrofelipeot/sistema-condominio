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
          className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm"
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
          className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-800"
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
        className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
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