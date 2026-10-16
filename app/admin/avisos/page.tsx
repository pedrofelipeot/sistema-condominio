import { formatarData } from "@/lib/format";
import { listarAvisos } from "@/lib/mock-data";

export default async function AvisosPage() {
  const avisos = await listarAvisos();

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
            Administração
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Gestão de avisos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Publique comunicados para os moradores e gerencie as informações
            exibidas no mural do condomínio.
          </p>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section
          aria-labelledby="novo-aviso-titulo"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 5v14m-7-7h14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <div>
              <h2
                id="novo-aviso-titulo"
                className="text-lg font-semibold tracking-tight text-slate-900"
              >
                Novo aviso
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Escreva um comunicado para os moradores.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="aviso-titulo"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Título
              </label>
              <input
                id="aviso-titulo"
                type="text"
                placeholder="Ex.: Manutenção da área comum"
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
              />
            </div>
            <div>
              <label
                htmlFor="aviso-texto"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Mensagem
              </label>
              <textarea
                id="aviso-texto"
                rows={5}
                placeholder="Escreva aqui as informações do comunicado..."
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <p className="text-xs leading-5 text-slate-500">
                O aviso será exibido no mural dos moradores.
              </p>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/25"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="m3 10 14-7-5 14-2-6-7-1Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
                Publicar aviso
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="avisos-publicados-titulo">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="avisos-publicados-titulo"
                className="text-xl font-semibold tracking-tight text-slate-900"
              >
                Avisos publicados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Comunicados disponíveis no mural dos moradores.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
              {avisos.length} {avisos.length === 1 ? "aviso" : "avisos"}
            </span>
          </div>

          {avisos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <h3 className="text-base font-semibold text-slate-900">
                Nenhum aviso publicado
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Os comunicados publicados aparecerão aqui.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {avisos.map((aviso) => (
                <li
                  key={aviso.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <article>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold tracking-tight text-slate-900">
                          {aviso.titulo}
                        </h3>
                        <time
                          dateTime={aviso.createdAt.toISOString()}
                          className="mt-1 block text-xs text-slate-500"
                        >
                          Publicado em {formatarData(aviso.createdAt)}
                        </time>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Editar aviso: ${aviso.titulo}`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="m12.5 4.2 3.3 3.3M3 17l3.8-.8L16.6 6.4a1.8 1.8 0 0 0-2.5-2.5L4.3 13.7 3 17Z"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label={`Excluir aviso: ${aviso.titulo}`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M4 6h12m-10 0 .7 10h6.6L14 6m-6-2h4l1 2H7l1-2Zm1 5v4m2-4v4"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {aviso.texto}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
