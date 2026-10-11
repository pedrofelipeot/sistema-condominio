import Link from "next/link";

export default function CasaLayout({ children }: { children: React.ReactNode }) {
  return (
        <div>
            <nav>
                <Link href="/admin">Voltar para o painel</Link>
                <Link href="/admin/casas">Lista de Casas</Link>
                <Link href="/admin/avisos">Lista de Avisos</Link>
            </nav>
                  <main>{children}</main>
        </div>
  );
}
