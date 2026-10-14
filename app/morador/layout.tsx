import Link from "next/link";

export default function MoradorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
          <Link
            href="/morador/avisos"
            className="text-sm font-semibold tracking-tight text-slate-900"
          >
            Área do morador
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            <Link
              href="/morador/avisos"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Avisos
            </Link>
            <Link
              href="/morador/pagamentos"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Pagamentos
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}