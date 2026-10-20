import { Suspense } from "react";
import FormularioDefinirSenha from "./FormularioDefinirSenha";

export default function DefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-6">
          <p role="status" className="text-base font-medium text-slate-600">
            Carregando...
          </p>
        </main>
      }
    >
      <FormularioDefinirSenha />
    </Suspense>
  );
}
