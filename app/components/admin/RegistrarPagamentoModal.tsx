"use client";

import { useState } from "react";
import { api, ErroApi } from "@/lib/api-cliente";
import type { CobrancaApi } from "@/lib/conversores";

type Props = {
  cobrancaId: number;
  competencia: string;
  onClose: () => void;
  onSuccess: (cobranca: CobrancaApi) => void;
};

export default function RegistrarPagamentoModal({
  cobrancaId,
  competencia,
  onClose,
  onSuccess,
}: Props) {
  const [dataPagamento, setDataPagamento] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function preencherDataDeHoje() {
    setDataPagamento(
      new Date().toLocaleDateString("sv-SE", {
        timeZone: "America/Sao_Paulo",
      }),
    );
  }

  async function registrarPagamento(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dataPagamento) {
      setErro("Informe a data do pagamento ou escolha a data de hoje.");
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      const atualizada = await api<CobrancaApi>(
        `/api/cobrancas/${cobrancaId}/pagamento`,
        {
          method: "PATCH",
          body: JSON.stringify({
            pagoEm: dataPagamento,
            formaPagamento: "DINHEIRO",
          }),
        },
      );
      onSuccess(atualizada);
    } catch (error) {
      setErro(
        error instanceof ErroApi
          ? error.message
          : "Não foi possível registrar o pagamento. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section
        aria-labelledby="registrar-pagamento-titulo"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="registrar-pagamento-titulo"
              className="text-lg font-semibold text-slate-900"
            >
              Registrar pagamento
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Competência {competencia} · pagamento em dinheiro
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            disabled={salvando}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={registrarPagamento}>
          <div>
            <label
              htmlFor="data-pagamento"
              className="block text-sm font-medium text-slate-700"
            >
              Data do pagamento
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                autoFocus
                id="data-pagamento"
                type="date"
                required
                value={dataPagamento}
                onChange={(event) => setDataPagamento(event.target.value)}
                className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15"
              />
              <button
                type="button"
                onClick={preencherDataDeHoje}
                className="min-h-11 rounded-lg border border-blue-200 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Data de Hoje
              </button>
            </div>
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
            >
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || !dataPagamento}
              className="min-h-10 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Registrando..." : "Confirmar pagamento"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
