import { Suspense } from "react";
import NavegacaoArea from "@/app/components/NavegacaoArea";

export default function CasaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Suspense fallback={null}>
        <NavegacaoArea area="admin" />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}