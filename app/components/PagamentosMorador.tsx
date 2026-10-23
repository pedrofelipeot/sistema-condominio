"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { formatarData, formatarMoeda } from "@/lib/format";
import { construirPixCopiaECola, type ConfiguracaoPixApi } from "@/lib/pix";
import { statusDaCobranca } from "@/lib/status";
import type { Casa, Cobranca, Morador } from "@/lib/types";
import PageHeader from "@/app/components/PageHeader";
import { acaoSecundaria } from "@/app/components/estilosAcoes";
import StatusBadge from "@/app/components/StatusBadge";
import { campoFormulario, rotuloCampo } from "@/app/components/estilosFormulario";

type Props = {
  morador: Morador;
  casa: Casa;
  cobrancas: Cobranca[];
  pix: ConfiguracaoPixApi;
};

type PixCobrancaProps = {
  pix: Extract<ConfiguracaoPixApi, { configurado: true }>;
  cobranca: Cobranca;
};

function PixCobranca({ pix, cobranca }: PixCobrancaProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [erroQr, setErroQr] = useState<string | null>(null);
  const [erroCopiar, setErroCopiar] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  let payload: string | null = null;
  let erroPayload: string | null = null;

  try {
    payload = construirPixCopiaECola({
      chave: pix.chave,
      nomeRecebedor: pix.nomeRecebedor,
      cidade: pix.cidade,
      valor: cobranca.valor,
      referencia: `C${cobranca.id}M${cobranca.competencia.replace("-", "")}`,
    });
  } catch (error) {
    erroPayload =
      error instanceof Error
        ? error.message
        : "Não foi possível preparar o pagamento Pix.";
  }

  useEffect(() => {
    if (!payload) return;

    let cancelado = false;
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 240,
    })
      .then((dataUrl) => {
        if (!cancelado) setQrCode(dataUrl);
      })
      .catch(() => {
        if (!cancelado) {
          setErroQr("Não foi possível gerar o QR Code desta cobrança.");
        }
      });

    return () => {
      cancelado = true;
    };
  }, [payload]);

  async function copiarPix() {
    if (!payload) return;

    try {
      await navigator.clipboard.writeText(payload);
      setCopiado(true);
      setErroCopiar(null);
    } catch {
      setErroCopiar(
        "Não foi possível copiar automaticamente. Selecione e copie o código Pix.",
      );
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 shadow-sm">
      {qrCode ? (
        <Image
          src={qrCode}
          alt={`QR Code Pix de ${formatarMoeda(cobranca.valor)} para ${formatarCompetencia(cobranca.competencia)}`}
          width={240}
          height={240}
          unoptimized
        />
      ) : erroPayload || erroQr ? (
        <p role="alert" className="text-sm text-[var(--morador-danger)]">
          {erroPayload ?? erroQr}
        </p>
      ) : (
        <p role="status" className="text-sm text-[var(--morador-text-secondary)]">
          Gerando QR Code...
        </p>
      )}
      {erroCopiar && (
        <p role="alert" className="text-sm text-[var(--morador-danger)]">
          {erroCopiar}
        </p>
      )}
      {payload && (
        <>
          <button
            type="button"
            onClick={() => void copiarPix()}
            className={acaoSecundaria}
          >
            {copiado ? "Pix copiado" : "Copiar código Pix"}
          </button>
          <label className={`${rotuloCampo} w-full`}>
            Pix copia e cola
            <textarea
              readOnly
              value={payload}
              rows={3}
              className={`${campoFormulario} mt-1 resize-y font-mono`}
            />
          </label>
        </>
      )}
    </div>
  );
}

function formatarCompetencia(competencia: string) {
  const [ano, mes] = competencia.split("-");
  const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, 1));

  return data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function tomStatus(status: string) {
  if (status === "Paga" || status === "Em dia") return "success" as const;
  if (status === "Em atraso") return "danger" as const;
  if (status === "Pendente") return "warning" as const;
  return "neutral" as const;
}

export default function PagamentosMorador({
  morador,
  casa,
  cobrancas,
  pix,
}: Props) {
  const [cobrancaPixId, setCobrancaPixId] = useState<number | null>(null);
  const anos = [...new Set(cobrancas.map((cobranca) => cobranca.competencia.slice(0, 4)))]
    .sort()
    .reverse();
  const [anoSelecionado, setAnoSelecionado] = useState(anos[0] ?? "");
  const cobrancasDoAno = cobrancas.filter(
    (cobranca) => cobranca.competencia.startsWith(`${anoSelecionado}-`),
  );
  const cobrancasEmAberto = cobrancas.filter(
    (cobranca) => cobranca.status === "PENDENTE",
  );
  const proximaCobranca = [...cobrancasEmAberto].sort(
    (a, b) => a.vencimento.getTime() - b.vencimento.getTime(),
  )[0];
  const cobrancaPix =
    cobrancasEmAberto.find((cobranca) => cobranca.id === cobrancaPixId) ??
    proximaCobranca;
  const totalEmAberto = cobrancasEmAberto.reduce(
    (total, cobranca) => total + cobranca.valor,
    0,
  );
  const statusAtual = proximaCobranca
    ? statusDaCobranca(proximaCobranca)
    : "Em dia";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Área do morador"
        title="Pagamentos"
        description={`Olá, ${morador.nome}. Consulte suas cobranças e pagamentos registrados.`}
        badge={`Casa ${casa.numero}`}
      />

      <section
        aria-label="Resumo da situação financeira"
        className="rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 shadow-sm"
      >
        <div className="grid divide-y divide-[var(--morador-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="flex items-center justify-between gap-4 py-4 sm:pr-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--morador-text-secondary)]">
                Total em aberto
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-[var(--morador-text-primary)]">
                {formatarMoeda(totalEmAberto)}
              </p>
            </div>
            <StatusBadge tone={tomStatus(statusAtual)}>
              {statusAtual}
            </StatusBadge>
          </div>
          <div className="py-4 sm:pl-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--morador-text-secondary)]">
              Próximo vencimento
            </p>
            <p
              className={`mt-1 text-xl font-semibold tracking-tight ${
                proximaCobranca && statusAtual === "Em atraso"
                  ? "text-[var(--morador-danger)]"
                  : proximaCobranca
                    ? "text-[var(--morador-warning)]"
                    : "text-[var(--morador-text-primary)]"
              }`}
            >
              {proximaCobranca
                ? formatarData(proximaCobranca.vencimento)
                : "Nenhum pendente"}
            </p>
            <p className="mt-1 text-base text-[var(--morador-text-secondary)]">
              {cobrancasEmAberto.length === 0
                ? "Nenhuma cobrança pendente"
                : `${cobrancasEmAberto.length} ${
                    cobrancasEmAberto.length === 1
                      ? "cobrança pendente"
                      : "cobranças pendentes"
                  }`}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="pagamento-pix-titulo"
        className="rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)] p-6 shadow-sm"
      >
          <h2 id="pagamento-pix-titulo" className="font-semibold tracking-tight text-[var(--morador-text-primary)]">
            Pagamento via Pix
          </h2>
          {!pix.configurado ? (
            <p className="mt-2 text-sm leading-6 text-[var(--morador-text-secondary)]">
              O Pix ainda não foi configurado. Solicite à administração que
              cadastre a chave e os dados do recebedor.
            </p>
          ) : !cobrancaPix ? (
            <p className="mt-2 text-sm leading-6 text-[var(--morador-text-secondary)]">
              Não há cobranças pendentes para pagar via Pix.
            </p>
          ) : (
            <>
              {cobrancasEmAberto.length > 1 && (
                <label className={`${rotuloCampo} mt-3`}>
                  Cobrança
                  <select
                    value={cobrancaPix.id}
                    onChange={(event) =>
                      setCobrancaPixId(Number(event.target.value))
                    }
                    className={`${campoFormulario} mt-1`}
                  >
                    {[...cobrancasEmAberto]
                      .sort(
                        (a, b) =>
                          a.vencimento.getTime() - b.vencimento.getTime(),
                      )
                      .map((cobranca) => (
                        <option key={cobranca.id} value={cobranca.id}>
                          {formatarCompetencia(cobranca.competencia)} ·{" "}
                          {formatarMoeda(cobranca.valor)}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <p className="mt-3 text-sm text-[var(--morador-text-secondary)]">
                {formatarCompetencia(cobrancaPix.competencia)} ·{" "}
                {formatarMoeda(cobrancaPix.valor)} · vence em{" "}
                {formatarData(cobrancaPix.vencimento)}
              </p>
              {pix.configurado && (
                <PixCobranca
                  key={cobrancaPix.id}
                  pix={pix}
                  cobranca={cobrancaPix}
                />
              )}
              <p className="mt-3 text-xs leading-5 text-[var(--morador-text-secondary)]">
                Confira o nome do recebedor e o valor antes de confirmar no
                aplicativo do banco. O QR Code não confirma o pagamento; a
                cobrança só será atualizada após a conferência manual pela
                administração.
              </p>
            </>
          )}
      </section>

      <section
        aria-labelledby="historico-pagamentos-titulo"
        className="overflow-hidden rounded-lg border border-[var(--morador-border)] bg-[var(--morador-surface)]"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--morador-border)] px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <h2
              id="historico-pagamentos-titulo"
              className="text-lg font-semibold tracking-tight text-[var(--morador-text-primary)]"
            >
              Histórico de pagamentos
            </h2>
            <p className="mt-1 text-base text-[var(--morador-text-secondary)]">
              Consulte cobranças, vencimentos e pagamentos registrados.
            </p>
          </div>
          <div className="sm:w-64">
            <label
              htmlFor="ano"
              className={rotuloCampo}
            >
              Filtrar por ano
            </label>
            <select
              id="ano"
              value={anoSelecionado}
              onChange={(event) => setAnoSelecionado(event.target.value)}
              disabled={anos.length === 0}
              className={campoFormulario}
            >
              {anos.length === 0 ? (
                <option value="">Sem histórico</option>
              ) : (
                anos.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-base">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">Competência</th>
                  <th scope="col" className="px-4 py-3 text-left">Valor</th>
                  <th scope="col" className="px-4 py-3 text-left">Vencimento</th>
                  <th scope="col" className="px-4 py-3 text-left">Pagamento</th>
                  <th scope="col" className="px-4 py-3 text-left">Forma</th>
                  <th scope="col" className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cobrancas.length === 0 || cobrancasDoAno.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-slate-600"
                    >
                      {cobrancas.length === 0
                        ? "Ainda não há cobranças registradas para esta unidade."
                        : "Não há cobranças para o ano selecionado."}
                    </td>
                  </tr>
                ) : null}
                {cobrancasDoAno.map((cobranca) => {
                  const status = statusDaCobranca(cobranca);

                  return (
                    <tr
                      key={cobranca.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-4 py-3 font-semibold capitalize text-slate-900"
                      >
                        {formatarCompetencia(cobranca.competencia)}
                      </th>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-800">
                        {formatarMoeda(cobranca.valor)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {formatarData(cobranca.vencimento)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {formatarData(cobranca.pagoEm)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {cobranca.formaPagamento ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        <StatusBadge tone={tomStatus(status)}>
                          {status}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      </section>
    </div>
  );
}
