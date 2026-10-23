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

  async function sair() {
    setEncerrando(true);
    setErro(null);

    try {
      await api<void>("/api/auth/logout", { method: "POST" });
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
        <div className="flex flex-wrap items-center gap-1">
          {linksPorArea[area].map(({ href, label }) => {
            const ativo =
              pathname === href ||
              (href !== `/${area}` && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={href}
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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
