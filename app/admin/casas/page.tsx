import { formatarMoeda } from "@/lib/format";
import { listarCasas } from "@/lib/mock-data";
import Link from "next/link";

export default async function CasasPage() {
  const casas = await listarCasas();
  const totalQuartos = casas.reduce((total, casa) => total + casa.quartos, 0);
  const receitaMensal = casas.reduce((total, casa) => total + casa.valorAluguel, 0);

  return (
    <div className="space-y-10">
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
            Gestão do condomínio
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Casas
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Acompanhe os imóveis cadastrados, consulte os valores e acesse os
            detalhes de cada unidade.
          </p>
        </div>
      </header>

      <section aria-label="Resumo das casas" className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Unidades cadastradas</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {casas.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">casas no condomínio</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total de quartos</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {totalQuartos}
          </p>
          <p className="mt-1 text-sm text-slate-500">somando todas as unidades</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Aluguel mensal previsto</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {formatarMoeda(receitaMensal)}
          </p>
          <p className="mt-1 text-sm text-slate-500">considerando todas as casas</p>
        </div>
      </section>

      <section aria-labelledby="lista-casas-titulo">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="lista-casas-titulo"
              className="text-xl font-semibold tracking-tight text-slate-900"
            >
              Todas as unidades
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecione uma casa para consultar moradores e cobranças.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            {casas.length} {casas.length === 1 ? "unidade" : "unidades"}
          </span>
        </div>

        {casas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              Nenhuma casa cadastrada
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              As unidades cadastradas aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {casas.map((casa) => (
              <li key={casa.id}>
                <Link
                  href={`/admin/casas/${casa.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100">
                        <svg
                          aria-hidden="true"
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          Unidade
                        </p>
                        <h3 className="mt-0.5 text-lg font-semibold text-slate-900">
                          Casa {casa.numero}
                        </h3>
                      </div>
                    </div>
                    <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                      {casa.quartos} {casa.quartos === 1 ? "quarto" : "quartos"}
                    </span>
                  </div>

                  <div className="my-5 h-px bg-slate-100" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Aluguel mensal</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {formatarMoeda(casa.valorAluguel)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Vencimento</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        Dia {casa.diaVencimento}
                      </p>
                    </div>
                  </div>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                    Ver detalhes
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
