import { notFound } from "next/navigation";
import Link from "next/link";
import CadastroMorador from "@/app/components/CadastroMorador";
import PageHeader from "@/app/components/PageHeader";
import { acaoSecundaria } from "@/app/components/estilosAcoes";

type Props = { params: Promise<{ id: string }> };

export const instant = false;

export default async function CadastroMoradorPage({ params }: Props) {
  const casaId = Number((await params).id);
  if (!Number.isInteger(casaId) || casaId < 1) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-7">
      <PageHeader
        eyebrow="Gestão de moradores"
        title="Cadastrar morador"
        description={`Cadastre os dados do morador e gere o convite para definir a senha de acesso à Casa ${casaId}.`}
        action={
          <Link
            href={`/admin/casas/${casaId}`}
            className={`${acaoSecundaria} whitespace-nowrap`}
          >
            Voltar para Casa {casaId}
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-2xl">
        <CadastroMorador casaId={casaId} />
      </div>
    </div>
  );
}
