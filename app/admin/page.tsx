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
import PageHeader from "@/app/components/PageHeader";
import { campoFormulario, rotuloCampo } from "@/app/components/estilosFormulario";

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
    <div className="space-y-7">
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="Acompanhe as cobranças e a situação mensal das unidades do condomínio."
        action={
          <section
            aria-labelledby="periodo-titulo"
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 id="periodo-titulo" className="text-sm font-semibold text-slate-800">
              Período
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className={rotuloCampo}>
                Ano
                <select
                  value={ano}
                  onChange={(event) => setAno(event.target.value)}
                  disabled={carregando || anos.length === 0}
                  className={campoFormulario}
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
              <label className={rotuloCampo}>
                Mês
                <select
                  value={mes}
                  onChange={(event) => setMes(event.target.value)}
                  disabled={carregando || anos.length === 0}
                  className={campoFormulario}
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
        }
      />

      {carregando ? (
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500"
        >
          Carregando o resumo das cobranças...
        </div>
      ) : erro ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-800"
        >
          {erro}
        </div>
      ) : (
        <PainelMensal casas={casas} cobrancas={cobrancasDoMes} />
      )}
    </div>
  );
}