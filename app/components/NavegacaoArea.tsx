"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api, ErroApi } from "@/lib/api-cliente";
import { acaoSecundaria } from "@/app/components/estilosAcoes";

type Area = "morador" | "admin";

const linksPorArea = {
  morador: [
    { href: "/morador", label: "Início" },
    { href: "/morador/pagamentos", label: "Pagamentos" },
    { href: "/morador/avisos", label: "Avisos" },
  ],
  admin: [
    { href: "/admin", label: "Painel" },
    { href: "/admin/casas", label: "Casas" },
    { href: "/admin/avisos", label: "Avisos" },
  ],
} satisfies Record<Area, { href: string; label: string }[]>;

export default function NavegacaoArea({ area }: { area: Area }) {
  const pathname = usePathname();
  const router = useRouter();
  const [encerrando, setEncerrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const classeMenu = [
    menuAberto ? "flex" : "hidden",
    "w-full flex-col gap-1 md:ml-auto md:flex md:w-auto md:flex-row md:items-center md:gap-1",
  ].join(" ");

  async function sair() {
    setEncerrando(true);
    setErro(null);

    try {
      await api<void>("/api/auth/logout", { method: "POST" });
      setEncerrando(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof ErroApi
          ? error.message
          : "Não foi possível encerrar sua sessão. Tente novamente.",
      );
      setEncerrando(false);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label={`Navegação da área ${area}`}
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8"
      >
        <Link
          href={area === "admin" ? "/admin" : "/morador"}
          className="text-base font-semibold tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Portal do Morador
        </Link>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
          aria-label={menuAberto ? "Fechar navegação" : "Abrir navegação"}
          aria-expanded={menuAberto}
          aria-controls="navegacao-area-links"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuAberto ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
        <div id="navegacao-area-links" className={classeMenu}>
          {linksPorArea[area].map(({ href, label }) => {
            const ativo =
              pathname === href ||
              (href !== `/${area}` && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuAberto(false)}
                aria-current={ativo ? "page" : undefined}
                className={`min-h-11 md:min-h-0 rounded-lg px-3 py-2 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  ativo
                    ? "bg-hover-light font-semibold text-link"
                    : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => void sair()}
            disabled={encerrando}
            className={`${acaoSecundaria} ml-1`}
          >
            {encerrando ? "Saindo..." : "Sair"}
          </button>
        </div>
      </nav>
      {erro && (
        <p
          role="alert"
          className="mx-auto max-w-7xl px-5 pb-3 text-sm text-red-600 sm:px-8"
        >
          {erro}
        </p>
      )}
    </header>
  );
}
