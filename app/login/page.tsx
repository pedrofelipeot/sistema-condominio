"use client";
import { useState } from "react";
import Image from "next/image";
import Campo from "../components/Campo";
import { acaoPrimaria } from "../components/estilosAcoes";
import { useRouter } from "next/navigation";
import { api, ErroApi } from "@/lib/api-cliente";

// O condomínio não tem nome oficial: usamos o nome do sistema
const NOME_SISTEMA = "Portal do Morador";

function IconeEmail() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconeCadeado() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      const usuario = await api<{
        id: number;
        perfil: string;
        precisaTrocarSenha: boolean;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha: password }),
      });

      router.push(usuario.perfil === "ADMIN" ? "/admin" : "/morador");
    } catch (e) {
      setError(
        e instanceof ErroApi ? e.message : "Erro inesperado. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    // h-dvh + overflow-hidden: a página nunca rola; se faltar altura, só o lado do formulário rola
    <main className="flex min-h-screen flex-col bg-slate-100 md:h-dvh md:overflow-hidden md:grid md:grid-cols-2 md:grid-rows-1">
      {/* Lado da foto (só aparece em telas médias para cima) */}
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
            {NOME_SISTEMA}
          </h2>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-slate-200">
            Aluguéis, pagamentos e avisos em um só lugar.
          </p>
        </div>
      </div>

      {/* Lado do formulário */}
      <section className="relative min-h-screen flex-1 bg-slate-100 md:min-h-0 md:overflow-hidden">
        {/* Área que rola se a janela for muito baixa; m-auto centraliza sem cortar o topo */}
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-10 md:h-full md:min-h-0 md:flex-row md:overflow-y-auto md:overscroll-contain md:py-5">
          <div className="mb-4 text-center md:hidden">
            <p className="text-xs font-semibold uppercase tracking-widest text-link">
              Gestão do condomínio
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {NOME_SISTEMA}
            </p>
          </div>
          <div className="relative m-auto w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <header>
              <p className="text-sm font-semibold uppercase tracking-widest text-link">
                Acesso ao sistema
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">
                Bem-vindo
              </h1>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                Entre com o e-mail e a senha fornecidos pela administração.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Campo
                label="E-mail"
                id="email"
                variant="login"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                autoComplete="email"
                icon={<IconeEmail />}
              />
              <Campo
                label="Senha"
                id="password"
                variant="login"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                icon={<IconeCadeado />}
              />
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-lg font-medium text-red-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="mt-0.5 h-6 w-6 shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}
              <button
                type="submit" disabled={enviando}
                className={`${acaoPrimaria} w-full`}
              >
                {enviando? 'Entrando...':'Entrar'}
              </button>
            </form>

            <p className="mt-4 rounded-lg border border-primary/20 bg-hover-light px-4 py-3 text-base text-primary">
              Esqueceu a senha? Fale com a administração.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
