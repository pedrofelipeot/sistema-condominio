"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  aberto: boolean;
  titulo: string;
  descricao: string;
  textoConfirmar?: string;
  processando?: boolean;
  textoCancelar?: string;
  textoProcessando?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function ModalConfirmacao({
  aberto,
  titulo,
  descricao,
  textoConfirmar = "Excluir",
  processando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const idDescricao = useId();

  // abre e fecha o <dialog> conforme a prop "aberto"
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      aria-describedby={idDescricao}
      // tecla Esc: deixa o React decidir, sem fechar sozinho
      onCancel={(e) => {
        e.preventDefault();
        if (!processando) onCancelar();
      }}
      // clique no fundo escuro (o alvo é o próprio dialog, e não o conteúdo)
      onClick={(e) => {
        if (e.target === e.currentTarget && !processando) onCancelar();
      }}
      className="m-auto w-full max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/50 md:max-h-none md:max-w-md md:overflow-visible"
    >
      <div className="p-4 sm:p-6">
        <h2 id={idTitulo} className="text-lg font-semibold text-slate-900">
          {titulo}
        </h2>
        <p id={idDescricao} className="mt-2 text-sm leading-6 text-slate-600">
          {descricao}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            onClick={onCancelar}
            disabled={processando}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm sm:min-h-10 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={processando}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-rose-700 px-4 py-2 text-sm sm:min-h-10 font-semibold text-white transition-colors hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60 w-full sm:w-auto"
          >
            {processando ? "Excluindo..." : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
