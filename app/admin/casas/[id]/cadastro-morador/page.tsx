// app/admin/casas/[id]/cadastro-morador/page.tsx
import { notFound } from "next/navigation";
import CadastroMorador from "@/app/components/CadastroMorador";

type Props = { params: Promise<{ id: string }> };

export default async function CadastroMoradorPage({ params }: Props) {
  const casaId = Number((await params).id);
  if (!Number.isInteger(casaId) || casaId < 1) notFound();

  return (
    <div className="space-y-8">
      <header>{/* o seu header padrão da área admin */}</header>
      <div className="max-w-xl">
        <CadastroMorador casaId={casaId} />
      </div>
    </div>
  );
}