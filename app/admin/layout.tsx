import type { Metadata } from "next";
import { Suspense } from "react";
import NavegacaoArea from "@/app/components/NavegacaoArea";

export const metadata: Metadata = {
  title: "Painel",
};

export default function CasaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Suspense fallback={null}>
        <NavegacaoArea area="admin" />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
