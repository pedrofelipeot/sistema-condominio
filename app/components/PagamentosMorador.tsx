"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { formatarData, formatarMoeda } from "@/lib/format";
import { construirPixCopiaECola, type ConfiguracaoPixApi } from "@/lib/pix";
import { statusDaCobranca } from "@/lib/status";
import type { Casa, Cobranca, Morador } from "@/lib/types";

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
    <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-emerald-100 bg-white p-4">
      {qrCode ? (
        <Image
          src={qrCode}
          alt={`QR Code Pix de ${formatarMoeda(cobranca.valor)} para ${formatarCompetencia(cobranca.competencia)}`}
          width={240}
          height={240}
          unoptimized
        />
      ) : erroPayload || erroQr ? (
        <p role="alert" className="text-sm text-rose-700">
          {erroPayload ?? erroQr}
        </p>
      ) : (
        <p role="status" className="text-sm text-slate-500">
          Gerando QR Code...
        </p>
      )}
      {erroCopiar && (
        <p role="alert" className="text-sm text-rose-700">
          {erroCopiar}
        </p>
      )}
      {payload && (
        <>
          <button
            type="button"
            onClick={() => void copiarPix()}
            className="min-h-10 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/15"
          >
            {copiado ? "Pix copiado" : "Copiar código Pix"}
          </button>
          <label className="w-full text-xs font-medium text-slate-600">
            Pix copia e cola
            <textarea
              readOnly
              value={payload}
              rows={3}
              className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-2 font-mono text-xs text-slate-700"
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

function classeStatus(status: string) {
  if (status === "Paga") return "bg-emerald-50 text-emerald-700";
  if (status === "Em atraso") return "bg-rose-50 text-rose-700";
  if (status === "Pendente") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-600";
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
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-11">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Área financeira
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Pagamentos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Olá, {morador.nome}. Consulte a situação do aluguel e o histórico
            de cobranças da sua unidade.
          </p>
        </div>
      </header>

      <section
        aria-label="Resumo da situação financeira"
        className="grid gap-4 md:grid-cols-2"
      >
        <article className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {proximaCobranca ? "Valor em aberto" : "Situação atual"}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {proximaCobranca ? formatarMoeda(totalEmAberto) : statusAtual}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${classeStatus(statusAtual)}`}
            >
              {statusAtual}
            </span>
          </div>
          {proximaCobranca ? (
            <p className="mt-3 text-sm text-slate-500">
              {cobrancasEmAberto.length === 1
                ? "Cobrança com vencimento em "
                : `${cobrancasEmAberto.length} cobranças em aberto · vencimento mais próximo em `}
              {formatarData(proximaCobranca.vencimento)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Não há cobranças pendentes registradas para esta unidade.
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold tracking-tight text-slate-900">
            Pagamento via Pix
          </h2>
          {!pix.configurado ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O Pix ainda não foi configurado. Solicite à administração que
              cadastre a chave e os dados do recebedor.
            </p>
          ) : !cobrancaPix ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Não há cobranças pendentes para pagar via Pix.
            </p>
          ) : (
            <>
              {cobrancasEmAberto.length > 1 && (
                <label className="mt-3 block text-sm font-medium text-slate-700">
                  Cobrança
                  <select
                    value={cobrancaPix.id}
                    onChange={(event) =>
                      setCobrancaPixId(Number(event.target.value))
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/15"
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
              <p className="mt-3 text-sm text-slate-600">
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
              <p className="mt-3 text-xs leading-5 text-slate-600">
                Confira o nome do recebedor e o valor antes de confirmar no
                aplicativo do banco. O QR Code não confirma o pagamento; a
                cobrança só será atualizada após a conferência manual pela
                administração.
              </p>
            </>
          )}
        </article>
      </section>

      <section
        aria-labelledby="historico-pagamentos-titulo"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <h2
              id="historico-pagamentos-titulo"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              Histórico de pagamentos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulte cobranças, vencimentos e pagamentos registrados.
            </p>
          </div>
          <div className="sm:w-64">
            <label
              htmlFor="ano"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Filtrar por ano
            </label>
            <select
              id="ano"
              value={anoSelecionado}
              onChange={(event) => setAnoSelecionado(event.target.value)}
              disabled={anos.length === 0}
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
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

        <div className="border-b border-slate-100 bg-blue-50/60 px-5 py-3.5 text-sm leading-6 text-blue-900 sm:px-6">
          As cobranças são vinculadas à unidade. O histórico abaixo corresponde
          à Casa {casa.numero}.
        </div>

        {cobrancas.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            Ainda não há cobranças registradas para esta unidade.
          </p>
        ) : cobrancasDoAno.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            Não há cobranças para o ano selecionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Competência</th>
                  <th scope="col" className="px-6 py-3.5">Valor</th>
                  <th scope="col" className="px-6 py-3.5">Vencimento</th>
                  <th scope="col" className="px-6 py-3.5">Pagamento</th>
                  <th scope="col" className="px-6 py-3.5">Forma</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cobrancasDoAno.map((cobranca) => {
                  const status = statusDaCobranca(cobranca);

                  return (
                    <tr
                      key={cobranca.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-semibold capitalize text-slate-900"
                      >
                        {formatarCompetencia(cobranca.competencia)}
                      </th>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                        {formatarMoeda(cobranca.valor)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatarData(cobranca.vencimento)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatarData(cobranca.pagoEm)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {cobranca.formaPagamento ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classeStatus(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
