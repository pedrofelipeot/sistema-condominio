"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ErroApi } from "@/lib/api-cliente";
import { converterCasa, type CasaApi } from "@/lib/conversores";
import type { Casa } from "@/lib/types";

type Resultado = {
  morador: { id: number; nome: string; email: string };
  convite: { link: string; expiraEm: string };
};

type ErrosPorCampo = Record<string, string[]>;

const campoClasse =
  "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15";

export default function CadastroMorador({ casaId: casaFixa }: { casaId?: number }) {
  const [casas, setCasas] = useState<Casa[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [casaId, setCasaId] = useState(casaFixa ? String(casaFixa) : "");
  const [dataEntrada, setDataEntrada] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampo, setErrosCampo] = useState<ErrosPorCampo>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    // com casa fixa busca só ela; sem casa fixa busca todas para o select
    const busca = casaFixa
      ? api<CasaApi>(`/api/casas/${casaFixa}`).then((c) => [converterCasa(c)])
      : api<CasaApi[]>("/api/casas").then((lista) => lista.map(converterCasa));

    busca
      .then((dados) => {
        if (!cancelado) setCasas(dados);
      })
      .catch((e) => {
        if (cancelado) return;
        setErro(e instanceof ErroApi ? e.message : "Erro inesperado. Tente novamente.");
      });

    return () => {
      cancelado = true;
    };
  }, [casaFixa]);

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setErrosCampo({});

    // verificação do front: só avisa mais rápido, o backend valida de novo
    if (!casaId) {
      setErrosCampo({ casaId: ["Escolha a casa."] });
      return;
    }

    setEnviando(true);

    try {
      const dados = await api<Resultado>("/api/morador", {
        method: "POST",
        body: JSON.stringify({ nome, email, casaId: Number(casaId), dataEntrada }),
      });
      setResultado(dados);
    } catch (e) {
      if (e instanceof ErroApi) {
        setErro(e.message);
        setErrosCampo(e.detalhes ?? {});
      } else {
        setErro("Erro inesperado. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  async function copiar() {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.convite.link);
      setCopiado(true);
    } catch {
      setCopiado(false); // o link continua visível para copiar à mão
    }
  }

  function novoCadastro() {
    setNome("");
    setEmail("");
    setCasaId(casaFixa ? String(casaFixa) : ""); // mantém a casa da URL
    setDataEntrada("");
    setResultado(null);
    setCopiado(false);
    setErro(null);
    setErrosCampo({});
  }

  if (resultado) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Morador cadastrado
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {resultado.morador.nome} ({resultado.morador.email})
        </p>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Envie este link ao morador (por exemplo, no WhatsApp). Ele aparece só agora e
          vale até {new Date(resultado.convite.expiraEm).toLocaleString("pt-BR")}. Com
          ele, o morador define a própria senha.
        </div>

        <label htmlFor="link-convite" className="mt-5 mb-2 block text-sm font-medium text-slate-700">
          Link de convite
        </label>
        <input
          id="link-convite"
          readOnly
          value={resultado.convite.link}
          onFocus={(e) => e.currentTarget.select()}
          className={campoClasse}
        />

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copiar}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
          >
            {copiado ? "Link copiado" : "Copiar link"}
          </button>
          <button
            type="button"
            onClick={novoCadastro}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cadastrar outro morador
          </button>
          {casaFixa && (
            <Link
              href={`/admin/casas/${casaFixa}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Voltar para a casa
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">Novo morador</h2>
      <p className="mt-1 text-sm text-slate-500">
        O morador receberá um link para definir a própria senha.
      </p>

      <form onSubmit={salvar} className="mt-6 space-y-5">
        <div>
          <label htmlFor="nome" className="mb-2 block text-sm font-medium text-slate-700">
            Nome
          </label>
          <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className={campoClasse} />
          {errosCampo.nome && <p className="mt-1.5 text-sm text-rose-700">{errosCampo.nome.join(" ")}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campoClasse}
          />
          {errosCampo.email && <p className="mt-1.5 text-sm text-rose-700">{errosCampo.email.join(" ")}</p>}
        </div>

        <div>
          <label htmlFor="casa" className="mb-2 block text-sm font-medium text-slate-700">
            Casa
          </label>
          {casaFixa ? (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              Casa {casas[0]?.numero ?? "..."}
            </p>
          ) : (
            <select
              id="casa"
              value={casaId}
              onChange={(e) => setCasaId(e.target.value)}
              className={campoClasse}
            >
              <option value="">Selecione...</option>
              {casas.map((casa) => (
                <option key={casa.id} value={casa.id}>
                  Casa {casa.numero}
                </option>
              ))}
            </select>
          )}
          {errosCampo.casaId && <p className="mt-1.5 text-sm text-rose-700">{errosCampo.casaId.join(" ")}</p>}
        </div>

        <div>
          <label htmlFor="entrada" className="mb-2 block text-sm font-medium text-slate-700">
            Data de entrada
          </label>
          <input
            id="entrada"
            type="date"
            value={dataEntrada}
            onChange={(e) => setDataEntrada(e.target.value)}
            className={campoClasse}
          />
          {errosCampo.dataEntrada && (
            <p className="mt-1.5 text-sm text-rose-700">{errosCampo.dataEntrada.join(" ")}</p>
          )}
        </div>

        {erro && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Cadastrando..." : "Cadastrar morador"}
        </button>
      </form>
    </section>
  );
}