"use client";

import { useEffect, useState } from "react";
import { formatarMoeda } from "@/lib/format";
import { api, ErroApi } from "@/lib/api-cliente";
import { converterCasa, type CasaComMoradoresApi } from "@/lib/conversores";
import Link from "next/link";
import type { Casa } from "@/lib/types";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
import { acaoSecundariaAzul } from "@/app/components/estilosAcoes";
import { campoFormulario, rotuloCampo } from "@/app/components/estilosFormulario";

export default function CasasPage() {
  const [casas, setCasas] = useState<Casa[]>([]);
  const [casasAtivasIds, setCasasAtivasIds] = useState<number[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroOcupacao, setFiltroOcupacao] = useState<
    "todas" | "ocupadas" | "vazias"
  >("todas");
  const [unidadesAtivas, setUnidadesAtivas] = useState(0);
  const [receitaMensal, setReceitaMensal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    api<CasaComMoradoresApi[]>("/api/casas")
      .then((dados) => {
        if (cancelado) return;

        const casasAtivas = dados.filter((casa) => casa.moradores.length > 0);
        setCasas(dados.map(converterCasa));
        setCasasAtivasIds(casasAtivas.map((casa) => casa.id));
        setUnidadesAtivas(casasAtivas.length);
        setReceitaMensal(
          casasAtivas.reduce(
            (total, casa) => total + Number(casa.valorAluguel),
            0,
          ),
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

  const casasFiltradas = casas.filter((casa) => {
    const correspondeBusca = String(casa.numero).includes(busca.trim());
    const ocupada = casasAtivasIds.includes(casa.id);
    const correspondeOcupacao =
      filtroOcupacao === "todas" ||
      (filtroOcupacao === "ocupadas" && ocupada) ||
      (filtroOcupacao === "vazias" && !ocupada);

    return correspondeBusca && correspondeOcupacao;
  });

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Gestão do condomínio"
        title="Casas"
        description="Acompanhe os imóveis cadastrados, consulte os valores e acesse os detalhes de cada unidade."
      />

      {carregando ? (
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500"
        >
          Carregando as casas...
        </div>
      ) : erro ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-800"
        >
          {erro}
        </div>
      ) : (
        <>
          <section
            aria-label="Resumo das casas"
            className="grid gap-3 sm:grid-cols-3"
          >
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Unidades cadastradas
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
                {casas.length}
              </p>
              <p className="mt-1 text-base text-slate-600">casas no condomínio</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Unidades ativas
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
                {unidadesAtivas}
              </p>
              <p className="mt-1 text-base text-slate-600">com morador ativo</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Aluguel mensal previsto
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
                {formatarMoeda(receitaMensal)}
              </p>
              <p className="mt-1 text-base text-slate-600">
                considerando casas ativas
              </p>
            </div>
          </section>

          <section aria-labelledby="lista-casas-titulo">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2
                  id="lista-casas-titulo"
                  className="text-xl font-semibold tracking-tight text-slate-950"
                >
                  Todas as unidades
                </h2>
                <p className="mt-1 text-base text-slate-600">
                  Selecione uma casa para consultar moradores e cobranças.
                </p>
              </div>
              {casas.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-[minmax(12rem,1fr)_auto] lg:min-w-[28rem]">
                  <label className={rotuloCampo}>
                    Pesquisar casa
                    <input
                      type="search"
                      inputMode="numeric"
                      value={busca}
                      onChange={(event) =>
                        setBusca(event.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Número da unidade"
                      className={campoFormulario}
                    />
                  </label>
                  <label className={rotuloCampo}>
                    Ocupação
                    <select
                      value={filtroOcupacao}
                      onChange={(event) => {
                        const valor = event.target.value;
                        if (
                          valor === "todas" ||
                          valor === "ocupadas" ||
                          valor === "vazias"
                        ) {
                          setFiltroOcupacao(valor);
                        }
                      }}
                      className={campoFormulario}
                    >
                      <option value="todas">Todas</option>
                      <option value="ocupadas">Ocupadas</option>
                      <option value="vazias">Vazias</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {casasFiltradas.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                    <p className="text-base text-slate-600" aria-live="polite">
                      {casasFiltradas.length}{" "}
                      {casasFiltradas.length === 1 ? "unidade" : "unidades"}
                    </p>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-base">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left">Unidade</th>
                        <th scope="col" className="px-4 py-3 text-left">Ocupação</th>
                        <th scope="col" className="px-4 py-3 text-left">Quartos</th>
                        <th scope="col" className="px-4 py-3 text-left">Aluguel mensal</th>
                        <th scope="col" className="px-4 py-3 text-left">Vencimento</th>
                        <th scope="col" className="px-4 py-3 text-left">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {casasFiltradas.map((casa) => {
                        const ocupada = casasAtivasIds.includes(casa.id);

                        return (
                          <tr
                            key={casa.id}
                            className="transition-colors hover:bg-slate-50"
                          >
                            <th
                              scope="row"
                              className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900"
                            >
                              Casa {casa.numero}
                            </th>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                              <StatusBadge tone={ocupada ? "success" : "neutral"}>
                                {ocupada ? "Ocupada" : "Vazia"}
                              </StatusBadge>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                              {casa.quartos} {casa.quartos === 1 ? "quarto" : "quartos"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-800">
                              {formatarMoeda(casa.valorAluguel)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                              Dia {casa.diaVencimento}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                              <Link
                                href={`/admin/casas/${casa.id}`}
                                className={acaoSecundariaAzul}
                                aria-label={`Ver detalhes da Casa ${casa.numero}`}
                              >
                                Ver detalhes
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                      {casasFiltradas.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center text-slate-600"
                          >
                            <p className="font-semibold text-slate-900">
                              {casas.length === 0
                                ? "Nenhuma casa cadastrada"
                                : "Nenhuma casa encontrada"}
                            </p>
                            <p className="mt-2">
                              {casas.length === 0
                                ? "As unidades cadastradas aparecerão aqui."
                                : "Ajuste a pesquisa ou o filtro de ocupação."}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
