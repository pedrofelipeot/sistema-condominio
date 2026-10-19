import GestaoAvisos from "@/app/components/admin/GestaoAvisos";

export default async function AvisosPage() {
  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-11">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Administração
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Gestão de avisos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Publique comunicados para os moradores e gerencie as informações
            exibidas no mural do condomínio.
          </p>
        </div>
      </header>

     <GestaoAvisos />
    </div>
  );
}
