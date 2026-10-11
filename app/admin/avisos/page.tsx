import { formatarData } from "@/app/lib/format";
import { listarAvisos } from "@/app/lib/mock-data";

export default async function AvisosPage() {
  const avisos = await listarAvisos();

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-11">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-amber-400/10 blur-2xl"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Comunicação do condomínio
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Avisos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Acompanhe comunicados importantes e fique por dentro das novidades
            do condomínio.
          </p>
        </div>
      </header>

      <section aria-labelledby="lista-avisos-titulo">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="lista-avisos-titulo"
              className="text-xl font-semibold tracking-tight text-slate-900"
            >
              Mural de comunicados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Os avisos mais recentes aparecem primeiro.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            {avisos.length} {avisos.length === 1 ? "aviso" : "avisos"}
          </span>
        </div>

        {avisos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
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
              Nenhum aviso publicado
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Quando houver novidades, os comunicados aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {avisos.map((aviso) => (
              <li
                key={aviso.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:border-amber-200 hover:shadow-md hover:shadow-slate-900/[0.04] sm:p-6"
              >
                <article className="flex gap-4 sm:gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-100">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 17v.01M12 14a2 2 0 1 0-2-2m2 9a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                        {aviso.titulo}
                      </h3>
                      <time
                        dateTime={aviso.createdAt.toISOString()}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="4.5"
                            width="14"
                            height="13"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M6.5 2.5v4m7-4v4M3 8.5h14"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.5"
                          />
                        </svg>
                        {formatarData(aviso.createdAt)}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 sm:text-base">
                      {aviso.texto}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
