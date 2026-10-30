"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Campo from "../components/Campo";
import PageHeader from "../components/PageHeader";
import { acaoPrimaria } from "../components/estilosAcoes";
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
          className="absolute inset-0 bg-slate-950/50"
        />
        <div className="absolute inset-x-0 bottom-0 p-10 lg:p-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-white">
            Gestão do condomínio
          </p>
          <h2 className="mt-2 text-4xl font-semibold leading-tight text-white">
            Portal do Morador
          </h2>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-slate-200">
            Acesse os serviços do seu condomínio em um só lugar.
          </p>
        </div>
      </div>

      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-8 sm:px-10 md:min-h-0">
        <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

          {!token ? (
            <>
              <PageHeader
                eyebrow="Convite de acesso"
                title="Link inválido"
                description="Este link de convite não é válido. Solicite um novo à administração."
              />
              <Link
                href="/login"
                className={`${acaoPrimaria} mt-6 w-full`}
              >
                Ir para o acesso
              </Link>
            </>
          ) : concluido ? (
            <>
              <PageHeader
                eyebrow="Acesso configurado"
                title="Senha definida"
                description="Sua senha foi definida com sucesso. Agora você já pode entrar no Portal do Morador."
              />
              <Link
                href="/login"
                className={`${acaoPrimaria} mt-6 w-full`}
              >
                Ir para o acesso
              </Link>
            </>
          ) : (
            <>
              <PageHeader
                eyebrow="Convite de acesso"
                title="Defina sua senha"
                description="Crie uma senha para acessar o Portal do Morador."
              />

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Campo
                  label="Nova senha"
                  id="nova-senha"
                  variant="login"
                  type="password"
                  value={novaSenha}
                  onChange={setNovaSenha}
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                />
                <Campo
                  label="Confirme a nova senha"
                  id="confirmar-senha"
                  variant="login"
                  type="password"
                  value={confirmarSenha}
                  onChange={setConfirmarSenha}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                />
                {erro && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-base font-medium text-red-800"
                  >
                    {erro}
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={enviando}
                    className={acaoPrimaria}
                  >
                    {enviando ? "Salvando..." : "Definir senha"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
