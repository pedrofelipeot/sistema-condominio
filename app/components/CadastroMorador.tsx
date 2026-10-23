"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ErroApi } from "@/lib/api-cliente";
import { converterCasa, type CasaApi } from "@/lib/conversores";
import type { Casa } from "@/lib/types";
import {
  acaoPrimaria,
  acaoSecundaria,
} from "@/app/components/estilosAcoes";
import {
  campoFormulario,
  erroCampoFormulario,
  rotuloCampo,
} from "@/app/components/estilosFormulario";

type Resultado = {
  morador: { id: number; nome: string; email: string };
  convite: { link: string; expiraEm: string };
};

type ErrosPorCampo = Record<string, string[]>;

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
      <section
        role="status"
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <p className="text-sm font-semibold text-emerald-700">Cadastro concluído</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Morador cadastrado
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {resultado.morador.nome} ({resultado.morador.email})
        </p>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Envie este link ao morador (por exemplo, no WhatsApp). Ele aparece só agora e
          vale até {new Date(resultado.convite.expiraEm).toLocaleString("pt-BR")}. Com
          ele, o morador define a própria senha.
        </div>

        <div className="mt-5">
          <label
            htmlFor="link-convite"
            className={rotuloCampo}
          >
            Link de convite
          </label>
          <input
            id="link-convite"
            readOnly
            value={resultado.convite.link}
            onFocus={(e) => e.currentTarget.select()}
            className={campoFormulario}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={copiar}
            className={acaoPrimaria}
          >
            {copiado ? "Link copiado" : "Copiar link"}
          </button>
          <button
            type="button"
            onClick={novoCadastro}
            className={acaoSecundaria}
          >
            Cadastrar outro morador
          </button>
          {casaFixa && (
            <Link
              href={`/admin/casas/${casaFixa}`}
              className={acaoSecundaria}
            >
              Voltar para a casa
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-slate-950">Dados do morador</h2>
      <p className="mt-1 text-base text-slate-600">
        O morador receberá um link para definir a própria senha.
      </p>

      <form onSubmit={salvar} className="mt-5 space-y-5">
        <div>
          <label htmlFor="nome" className={rotuloCampo}>
            Nome <span className="font-normal text-slate-500">(obrigatório)</span>
          </label>
          <input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            aria-invalid={Boolean(errosCampo.nome)}
            aria-describedby={errosCampo.nome ? "nome-erro" : undefined}
            className={campoFormulario}
          />
          {errosCampo.nome && (
            <p id="nome-erro" className={erroCampoFormulario}>
              {errosCampo.nome.join(" ")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={rotuloCampo}>
            E-mail <span className="font-normal text-slate-500">(obrigatório)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errosCampo.email)}
            aria-describedby={errosCampo.email ? "email-erro" : undefined}
            className={campoFormulario}
          />
          {errosCampo.email && (
            <p id="email-erro" className={erroCampoFormulario}>
              {errosCampo.email.join(" ")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={casaFixa ? undefined : "casa"}
            className={rotuloCampo}
          >
            Casa <span className="font-normal text-slate-500">(obrigatório)</span>
          </label>
          {casaFixa ? (
            <p
              id="casa"
              className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base font-medium text-slate-700"
            >
              Casa {casas[0]?.numero ?? "..."}
            </p>
          ) : (
            <select
              id="casa"
              value={casaId}
              onChange={(e) => setCasaId(e.target.value)}
              aria-invalid={Boolean(errosCampo.casaId)}
              aria-describedby={errosCampo.casaId ? "casa-erro" : undefined}
              className={campoFormulario}
            >
              <option value="">Selecione...</option>
              {casas.map((casa) => (
                <option key={casa.id} value={casa.id}>
                  Casa {casa.numero}
                </option>
              ))}
            </select>
          )}
          {errosCampo.casaId && (
            <p id="casa-erro" className={erroCampoFormulario}>
              {errosCampo.casaId.join(" ")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="entrada" className={rotuloCampo}>
            Data de entrada <span className="font-normal text-slate-500">(obrigatório)</span>
          </label>
          <input
            id="entrada"
            type="date"
            value={dataEntrada}
            onChange={(e) => setDataEntrada(e.target.value)}
            aria-invalid={Boolean(errosCampo.dataEntrada)}
            aria-describedby={errosCampo.dataEntrada ? "entrada-erro" : undefined}
            className={campoFormulario}
          />
          {errosCampo.dataEntrada && (
            <p id="entrada-erro" className={erroCampoFormulario}>
              {errosCampo.dataEntrada.join(" ")}
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

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={enviando}
            className={acaoPrimaria}
          >
            {enviando ? "Cadastrando..." : "Cadastrar morador"}
          </button>
        </div>
      </form>
    </section>
  );
}