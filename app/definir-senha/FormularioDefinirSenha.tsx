"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Campo from "../components/Campo";
import { api, ErroApi } from "@/lib/api-cliente";

export default function FormularioDefinirSenha() {
  const parametros = useSearchParams();
  const token = parametros.get("token") ?? "";
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!token) {
      setErro("Link de convite inválido. Solicite um novo link à administração.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setEnviando(true);
    try {
      await api<void>("/api/auth/definir-senha", {
        method: "POST",
        body: JSON.stringify({ token, novaSenha, confirmarSenha }),
      });
      setConcluido(true);
    } catch (e) {
      setErro(
        e instanceof ErroApi ? e.message : "Erro inesperado. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-slate-100 md:grid md:grid-cols-2">
      <div className="relative hidden min-h-0 md:block">
        <Image
          src="/condominio.png"
          alt="Fachada do condomínio"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-10 lg:p-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-white">
            Gestão do condomínio
          </p>
          <h2 className="mt-2 text-4xl font-bold leading-tight text-white">
            Portal do Morador
          </h2>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-slate-200">
            Acesse os serviços do seu condomínio em um só lugar.
          </p>
        </div>
      </div>

      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-8 sm:px-10 md:min-h-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-300/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl"
        />

        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/50 sm:p-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-700 to-sky-500"
          />

          {!token ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                Convite de acesso
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Link inválido
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Este link de convite não é válido. Solicite um novo à administração.
              </p>
              <Link
                href="/login"
                className="mt-6 flex min-h-14 w-full items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-xl font-bold text-white shadow-md shadow-blue-700/30 transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Ir para o acesso
              </Link>
            </>
          ) : concluido ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
                Acesso configurado
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Senha definida
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Sua senha foi definida com sucesso. Agora você já pode entrar no
                Portal do Morador.
              </p>
              <Link
                href="/login"
                className="mt-6 flex min-h-14 w-full items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-xl font-bold text-white shadow-md shadow-blue-700/30 transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Ir para o acesso
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                Convite de acesso
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Defina sua senha
              </h1>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                Crie uma senha para acessar o Portal do Morador.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Campo
                  label="Nova senha"
                  id="nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={setNovaSenha}
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                />
                <Campo
                  label="Confirme a nova senha"
                  id="confirmar-senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={setConfirmarSenha}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                />
                {erro && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-base font-medium text-red-800"
                  >
                    {erro}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={enviando}
                  className="min-h-14 w-full rounded-xl bg-blue-700 px-6 py-3 text-xl font-bold text-white shadow-md shadow-blue-700/30 transition-colors hover:bg-blue-800 active:bg-blue-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enviando ? "Salvando..." : "Definir senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
