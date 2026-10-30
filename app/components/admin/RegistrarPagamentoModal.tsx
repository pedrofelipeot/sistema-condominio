"use client";

import { useState } from "react";
import { api, ErroApi } from "@/lib/api-cliente";
import type { CobrancaApi } from "@/lib/conversores";
import {
  acaoPrimaria,
  acaoSecundaria,
} from "@/app/components/estilosAcoes";
import { campoFormulario, rotuloCampo } from "@/app/components/estilosFormulario";

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
  const [formaPagamento, setFormaPagamento] = useState<"PIX" | "DINHEIRO">(
    "DINHEIRO",
  );
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
            formaPagamento,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <section
        aria-labelledby="registrar-pagamento-titulo"
        aria-modal="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6"
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
              Competência {competencia} · pagamento via{" "}
              {formaPagamento === "PIX" ? "Pix" : "dinheiro"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            disabled={salvando}
            className={acaoSecundaria}
          >
            &times;
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={registrarPagamento}>
          <div>
            <label
              htmlFor="forma-pagamento"
              className={rotuloCampo}
            >
              Forma de pagamento
            </label>
            <select
              id="forma-pagamento"
              value={formaPagamento}
              onChange={(event) =>
                setFormaPagamento(
                  event.target.value === "PIX" ? "PIX" : "DINHEIRO",
                )
              }
              className={`${campoFormulario} mt-1`}
            >
              <option value="PIX">Pix</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="data-pagamento"
              className={rotuloCampo}
            >
              Data do pagamento
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                autoFocus
                id="data-pagamento"
                type="date"
                required
                value={dataPagamento}
                onChange={(event) => {
                  setDataPagamento(event.target.value);
                  setErro(null);
                }}
                aria-invalid={Boolean(erro && !dataPagamento)}
                aria-describedby={erro ? "data-pagamento-erro" : undefined}
                className={`${campoFormulario} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={preencherDataDeHoje}
                className={`${acaoSecundaria} w-full sm:w-auto`}
              >
                Data de Hoje
              </button>
            </div>
            {erro && (
              <p
                id="data-pagamento-erro"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {erro}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className={`${acaoSecundaria} w-full sm:w-auto`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || !dataPagamento}
              className={`${acaoPrimaria} w-full sm:w-auto`}
            >
              {salvando ? "Registrando..." : "Confirmar pagamento"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
