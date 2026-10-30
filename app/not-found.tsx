import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { acaoPrimaria, acaoSecundaria } from "@/app/components/estilosAcoes";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-6 py-8">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <PageHeader
          eyebrow="Erro 404"
          title="Página não encontrada"
          description="O endereço acessado não existe ou foi alterado. Confira o link ou volte para uma página do sistema."
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={`${acaoPrimaria} flex-1`}>
            Ir para o início
          </Link>
          <Link href="/login" className={`${acaoSecundaria} flex-1`}>
            Ir para o acesso
          </Link>
        </div>
      </section>
    </main>
  );
}
