'use client';
import { useState } from 'react';
import Image from 'next/image';
import Campo from '../components/Campo';

// O condomínio não tem nome oficial: usamos o nome do sistema
const NOME_SISTEMA = 'Portal do Morador';

function IconeEmail() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </svg>
    );
}

function IconeCadeado() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
    );
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setError('');
        console.log('Email:', email);
    }

    return (
        // h-dvh + overflow-hidden: a página nunca rola; se faltar altura, só o lado do formulário rola
        <main className="flex h-dvh flex-col overflow-hidden md:grid md:grid-cols-2 md:grid-rows-1">
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
                    className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-10 lg:p-14">
                    <p className="text-sm font-semibold uppercase tracking-widest text-white">
                        Gestão do condomínio
                    </p>
                    <h2 className="mt-2 text-4xl font-bold leading-tight text-white">
                        {NOME_SISTEMA}
                    </h2>
                    <p className="mt-3 max-w-md text-lg leading-relaxed text-slate-200">
                        Aluguéis, pagamentos e avisos em um só lugar.
                    </p>
                </div>
            </div>

            {/* Lado do formulário */}
            <section className="relative min-h-0 flex-1 overflow-hidden bg-slate-100">
                {/* Manchas de cor ao fundo (decorativas, fora da área que rola) */}
                <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-300/40 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl" />

                {/* Área que rola se a janela for muito baixa; m-auto centraliza sem cortar o topo */}
                <div className="relative flex h-full overflow-y-auto overscroll-contain px-6 py-5 sm:px-10">
                    <div className="relative m-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/50 sm:p-8">
                        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-700 to-sky-500" />

                        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                            Acesso ao sistema
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-slate-900">Bem-vindo</h1>
                        <p className="mt-2 text-base leading-relaxed text-slate-600">
                            Entre com o e-mail e a senha fornecidos pela administração.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <Campo
                                label="E-mail"
                                id="email"
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
                                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-lg font-medium text-red-800"
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
                                type="submit"
                                className="min-h-14 w-full rounded-xl bg-blue-700 px-6 py-3 text-xl font-bold text-white shadow-md shadow-blue-700/30 transition-colors hover:bg-blue-800 active:bg-blue-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                            >
                                Entrar
                            </button>
                        </form>

                        <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-base text-blue-900">
                            Esqueceu a senha? Fale com a administração.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}