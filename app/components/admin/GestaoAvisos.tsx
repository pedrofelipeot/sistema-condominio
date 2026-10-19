"use client";

import { useEffect, useState } from "react";
import { api, ErroApi } from "@/lib/api-cliente";
import { formatarData } from "@/lib/format";

type Aviso = {
  id: number;
  titulo: string;
  texto: string;
  createdAt: string; // chega como texto no JSON
};

type ErrosPorCampo = Record<string, string[]>;

export default function GestaoAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [versao, setVersao] = useState(0); // muda para pedir uma nova busca

  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [erro, setErro] = useState<string | null>(null);
  const [errosCampo, setErrosCampo] = useState<ErrosPorCampo>({});

  function tratarFalha(e: unknown) {
    if (e instanceof ErroApi) {
      setErro(e.message);
      setErrosCampo(e.detalhes ?? {});
    } else {
      setErro("Erro inesperado. Tente novamente.");
      setErrosCampo({});
    }
  }

  function limparErros() {
    setErro(null);
    setErrosCampo({});
  }

  function limparFormulario() {
    setTitulo("");
    setTexto("");
    setEditandoId(null);
  }

  function recarregar() {
    setVersao((v) => v + 1);
  }

  /* GET: listar (roda ao abrir a tela e sempre que "versao" muda) */
  useEffect(() => {
    let cancelado = false;

    api<Aviso[]>("/api/avisos")
      .then((dados) => {
        if (!cancelado) setAvisos(dados);
      })
      .catch((e) => {
        if (cancelado) return;
        setErro(e instanceof ErroApi ? e.message : "Erro inesperado. Tente novamente.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    // se a tela fechar ou o efeito rodar de novo, ignora a resposta antiga
    return () => {
      cancelado = true;
    };
  }, [versao]);

  /* POST (criar) ou PATCH (editar), conforme editandoId */
  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    limparErros();
    setEnviando(true);

    try {
      if (editandoId === null) {
        await api("/api/avisos", {
          method: "POST",
          body: JSON.stringify({ titulo, texto }),
        });
      } else {
        await api(`/api/avisos/${editandoId}`, {
          method: "PATCH",
          body: JSON.stringify({ titulo, texto }),
        });
      }

      limparFormulario();
      recarregar();
    } catch (e) {
      tratarFalha(e);
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicao(aviso: Aviso) {
    limparErros();
    setEditandoId(aviso.id);
    setTitulo(aviso.titulo);
    setTexto(aviso.texto);
  }

  function cancelarEdicao() {
    limparErros();
    limparFormulario();
  }

  /* DELETE: excluir */
  async function excluir(aviso: Aviso) {
    if (!confirm(`Excluir o aviso "${aviso.titulo}"?`)) return;
    limparErros();

    try {
      await api(`/api/avisos/${aviso.id}`, { method: "DELETE" });
      if (editandoId === aviso.id) limparFormulario();
      recarregar();
    } catch (e) {
      tratarFalha(e);
    }
  }

  const editando = editandoId !== null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      {/* Formulário: criar e editar */}
      <section
        aria-labelledby="novo-aviso-titulo"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          </span>
          <div>
            <h2 id="novo-aviso-titulo" className="text-lg font-semibold tracking-tight text-slate-900">
              {editando ? "Editar aviso" : "Novo aviso"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editando
                ? "Altere o título ou a mensagem e salve."
                : "Escreva um comunicado para os moradores."}
            </p>
          </div>
        </div>

        <form onSubmit={salvar} className="space-y-5">
          <div>
            <label htmlFor="aviso-titulo" className="mb-2 block text-sm font-medium text-slate-700">
              Título
            </label>
            <input
              id="aviso-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Manutenção da área comum"
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
            />
            {errosCampo.titulo && (
              <p className="mt-1.5 text-sm text-rose-700">{errosCampo.titulo.join(" ")}</p>
            )}
          </div>

          <div>
            <label htmlFor="aviso-texto" className="mb-2 block text-sm font-medium text-slate-700">
              Mensagem
            </label>
            <textarea
              id="aviso-texto"
              rows={5}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreva aqui as informações do comunicado..."
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
            />
            {errosCampo.texto && (
              <p className="mt-1.5 text-sm text-rose-700">{errosCampo.texto.join(" ")}</p>
            )}
          </div>

          {erro && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {erro}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="text-xs leading-5 text-slate-500">
              O aviso será exibido no mural dos moradores.
            </p>
            <div className="flex items-center gap-2">
              {editando && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/25"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Publicar aviso"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Lista de avisos */}
      <section aria-labelledby="avisos-publicados-titulo">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="avisos-publicados-titulo" className="text-xl font-semibold tracking-tight text-slate-900">
              Avisos publicados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Comunicados disponíveis no mural dos moradores.
            </p>
          </div>
          {!carregando && (
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
              {avisos.length} {avisos.length === 1 ? "aviso" : "avisos"}
            </span>
          )}
        </div>

        {carregando ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            Carregando avisos...
          </p>
        ) : avisos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">Nenhum aviso publicado</h3>
            <p className="mt-2 text-sm text-slate-500">Os comunicados publicados aparecerão aqui.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {avisos.map((aviso) => {
              const publicadoEm = new Date(aviso.createdAt);

              return (
                <li key={aviso.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <article>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold tracking-tight text-slate-900">{aviso.titulo}</h3>
                        <time dateTime={publicadoEm.toISOString()} className="mt-1 block text-xs text-slate-500">
                          Publicado em {formatarData(publicadoEm)}
                        </time>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(aviso)}
                          aria-label={`Editar aviso: ${aviso.titulo}`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
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
                          onClick={() => excluir(aviso)}
                          aria-label={`Excluir aviso: ${aviso.titulo}`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                        >
                          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
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
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{aviso.texto}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}