"use client";

import { useEffect, useState } from "react";
import { api, ErroApi } from "@/lib/api-cliente";
import { formatarData } from "@/lib/format";
import PageHeader from "@/app/components/PageHeader";
import {
  acaoPerigosa,
  acaoPrimaria,
  acaoSecundaria,
  acaoSobreCabecalho,
} from "@/app/components/estilosAcoes";
import ModalConfirmacao from "@/app/components/ModalConfirmacao";
import {
  campoFormulario,
  erroCampoFormulario,
  rotuloCampo,
} from "@/app/components/estilosFormulario";

type Aviso = {
  id: number;
  titulo: string;
  texto: string;
  createdAt: string;
};

type ErrosPorCampo = Record<string, string[]>;

function formularioFoiAlterado(
  avisos: Aviso[],
  editandoId: number | null,
  titulo: string,
  texto: string,
) {
  const original = avisos.find((aviso) => aviso.id === editandoId);
  if (!original) return Boolean(titulo.trim() || texto.trim());
  return titulo !== original.titulo || texto !== original.texto;
}

export default function GestaoAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [versao, setVersao] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [avisoParaExcluir, setAvisoParaExcluir] = useState<Aviso | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [conteudosAbertos, setConteudosAbertos] = useState<Set<number>>(
    () => new Set(),
  );
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampo, setErrosCampo] = useState<ErrosPorCampo>({});

  function tratarFalha(error: unknown) {
    if (error instanceof ErroApi) {
      setErro(error.message);
      setErrosCampo(error.detalhes ?? {});
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

  function fecharModal() {
    if (enviando) return;
    if (
      formularioFoiAlterado(avisos, editandoId, titulo, texto) &&
      !confirm("Descartar as alterações não salvas?")
    ) {
      return;
    }
    setModalAberto(false);
    limparFormulario();
    limparErros();
  }

  function abrirNovoAviso() {
    limparFormulario();
    limparErros();
    setModalAberto(true);
  }

  function recarregar() {
    setVersao((atual) => atual + 1);
  }

  useEffect(() => {
    let cancelado = false;

    api<Aviso[]>("/api/avisos")
      .then((dados) => {
        if (!cancelado) setAvisos(dados);
      })
      .catch((error) => {
        if (!cancelado) {
          setErro(
            error instanceof ErroApi
              ? error.message
              : "Erro inesperado. Tente novamente.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [versao]);

  useEffect(() => {
    if (!modalAberto) return;

    function tratarTecla(event: KeyboardEvent) {
      if (event.key !== "Escape" || enviando) return;
      if (
        formularioFoiAlterado(avisos, editandoId, titulo, texto) &&
        !confirm("Descartar as alterações não salvas?")
      ) {
        return;
      }
      setModalAberto(false);
      limparFormulario();
      limparErros();
    }

    window.addEventListener("keydown", tratarTecla);
    return () => window.removeEventListener("keydown", tratarTecla);
  }, [modalAberto, enviando, titulo, texto, editandoId, avisos]);

  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

      setModalAberto(false);
      limparFormulario();
      recarregar();
    } catch (error) {
      tratarFalha(error);
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicao(aviso: Aviso) {
    limparErros();
    setEditandoId(aviso.id);
    setTitulo(aviso.titulo);
    setTexto(aviso.texto);
    setModalAberto(true);
  }

  async function excluir() {
    if (!avisoParaExcluir || excluindo) return;

    limparErros();
    setExcluindo(true);

    try {
      await api(`/api/avisos/${avisoParaExcluir.id}`, {
        method: "DELETE",
      });

      if (editandoId === avisoParaExcluir.id) {
        setModalAberto(false);
        limparFormulario();
      }

      setAvisoParaExcluir(null);
      recarregar();
    } catch (error) {
      tratarFalha(error);
    } finally {
      setExcluindo(false);
    }
  }

  function alternarConteudo(id: number) {
    setConteudosAbertos((atuais) => {
      const novos = new Set(atuais);
      if (novos.has(id)) novos.delete(id);
      else novos.add(id);
      return novos;
    });
  }

  const avisosFiltrados = avisos.filter((aviso) => {
    const termo = termoBusca.trim().toLocaleLowerCase("pt-BR");
    return (
      !termo ||
      aviso.titulo.toLocaleLowerCase("pt-BR").includes(termo) ||
      aviso.texto.toLocaleLowerCase("pt-BR").includes(termo)
    );
  });
  const editando = editandoId !== null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Avisos"
        description="Publique comunicados para os moradores e gerencie as informações do mural do condomínio."
        action={
          <button
            type="button"
            onClick={abrirNovoAviso}
            className={acaoSobreCabecalho}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            Novo aviso
          </button>
        }
      />

      {erro && !modalAberto && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
        >
          {erro}
        </div>
      )}

      <section
        aria-labelledby="avisos-publicados-titulo"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="avisos-publicados-titulo"
              className="text-lg font-semibold tracking-tight text-slate-950"
            >
              Avisos publicados
            </h2>
            <p className="mt-1 text-base text-slate-600">
              Comunicados disponíveis no mural dos moradores.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <label className="sr-only" htmlFor="buscar-aviso">
              Buscar avisos
            </label>
            <input
              id="buscar-aviso"
              type="search"
              value={termoBusca}
              onChange={(event) => setTermoBusca(event.target.value)}
              placeholder="Buscar avisos..."
              className={`${campoFormulario} min-w-0 flex-1 sm:w-56 sm:flex-none`}
            />
            {!carregando && (
              <span className="text-base text-slate-600">
                {avisosFiltrados.length} de {avisos.length}
              </span>
            )}
          </div>
        </div>

        {carregando ? (
          <p
            role="status"
            className="px-6 py-12 text-center text-base text-slate-600"
          >
            Carregando avisos...
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-base">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left">
                      Aviso
                    </th>
                    <th scope="col" className="px-4 py-3 text-left">
                      Publicado em
                    </th>
                    <th scope="col" className="px-4 py-3 text-left">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {avisosFiltrados.map((aviso) => {
                    const publicadoEm = new Date(aviso.createdAt);

                    return (
                      <tr
                        key={aviso.id}
                        className="align-top transition-colors hover:bg-slate-50"
                      >
                        <td className="max-w-2xl px-4 py-3 text-slate-800">
                          <p className="break-words font-semibold text-slate-900">
                            {aviso.titulo}
                          </p>
                          <p className="mt-1 break-words whitespace-pre-line text-base leading-6 text-slate-600">
                            {aviso.texto}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                          <time dateTime={publicadoEm.toISOString()}>
                            {formatarData(publicadoEm)}
                          </time>
                        </td>
                        <td className="px-4 py-3 text-slate-800">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => iniciarEdicao(aviso)}
                              className={acaoSecundaria}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                limparErros();
                                setAvisoParaExcluir(aviso);
                              }}
                              className={acaoPerigosa}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {avisosFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-12 text-center text-slate-600"
                      >
                        <p className="font-semibold text-slate-900">
                          {avisos.length === 0
                            ? "Nenhum aviso publicado"
                            : "Nenhum aviso encontrado"}
                        </p>
                        <p className="mt-2">
                          {avisos.length === 0
                            ? "Os comunicados publicados aparecerão aqui."
                            : "Tente buscar por outro título ou conteúdo."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) fecharModal();
          }}
        >
          <section
            aria-labelledby="formulario-aviso-titulo"
            aria-modal="true"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="formulario-aviso-titulo"
                  className="text-lg font-semibold tracking-tight text-slate-950"
                >
                  {editando ? "Editar aviso" : "Novo aviso"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {editando
                    ? "Altere o título ou a mensagem e salve."
                    : "Escreva um comunicado para os moradores."}
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={fecharModal}
                disabled={enviando}
                className={acaoSecundaria}
              >
                ×
              </button>
            </div>

            <form onSubmit={salvar} className="mt-6 space-y-5">
              <div>
                <label htmlFor="aviso-titulo" className={rotuloCampo}>
                  Título{" "}
                  <span className="font-normal text-slate-500">
                    (obrigatório)
                  </span>
                </label>
                <input
                  autoFocus
                  id="aviso-titulo"
                  type="text"
                  required
                  maxLength={100}
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  aria-invalid={Boolean(errosCampo.titulo)}
                  aria-describedby={
                    errosCampo.titulo ? "aviso-titulo-erro" : undefined
                  }
                  placeholder="Ex.: Manutenção da área comum"
                  className={campoFormulario}
                />
                {errosCampo.titulo && (
                  <p id="aviso-titulo-erro" className={erroCampoFormulario}>
                    {errosCampo.titulo.join(" ")}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="aviso-texto" className={rotuloCampo}>
                  Mensagem{" "}
                  <span className="font-normal text-slate-500">
                    (obrigatório)
                  </span>
                </label>
                <textarea
                  id="aviso-texto"
                  rows={7}
                  required
                  maxLength={2000}
                  value={texto}
                  onChange={(event) => setTexto(event.target.value)}
                  aria-invalid={Boolean(errosCampo.texto)}
                  aria-describedby={
                    errosCampo.texto ? "aviso-texto-erro" : undefined
                  }
                  placeholder="Escreva aqui as informações do comunicado..."
                  className={`${campoFormulario} resize-y leading-6`}
                />
                {errosCampo.texto && (
                  <p id="aviso-texto-erro" className={erroCampoFormulario}>
                    {errosCampo.texto.join(" ")}
                  </p>
                )}
              </div>

              {erro && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
                >
                  {erro}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <p className="text-xs leading-5 text-slate-500">
                  O aviso será exibido no mural dos moradores.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fecharModal}
                    disabled={enviando}
                    className={acaoSecundaria}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className={acaoPrimaria}
                  >
                    {enviando
                      ? "Salvando..."
                      : editando
                        ? "Salvar alterações"
                        : "Publicar aviso"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
      <ModalConfirmacao
        aberto={avisoParaExcluir !== null}
        titulo="Excluir aviso?"
        descricao={
          avisoParaExcluir
            ? `Tem certeza de que deseja excluir o aviso "${avisoParaExcluir.titulo}"? Essa ação não poderá ser desfeita.`
            : ""
        }
        textoConfirmar="Excluir aviso"
        processando={excluindo}
        onConfirmar={excluir}
        onCancelar={() => {
          if (excluindo) return;

          setAvisoParaExcluir(null);
          limparErros();
        }}
      />
    </div>
  );
}
