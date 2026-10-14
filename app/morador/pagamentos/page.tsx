import PagamentosMorador from "@/app/components/PagamentosMorador";
import {
  buscarCasa,
  buscarMorador,
  listarCobrancasDaCasa,
} from "@/app/lib/mock-data";
import { notFound } from "next/navigation";

export default async function PagamentosPage() {
  // TODO(auth): substituir o ID fixo pelo ID do morador autenticado na sessão.
  const moradorId = 1;
  const morador = await buscarMorador(moradorId);

  if (!morador) {
    return notFound();
  }

  const casa = await buscarCasa(morador.casaId);

  if (!casa) {
    return notFound();
  }

  const cobrancas = await listarCobrancasDaCasa(casa.id);

  return (
    <PagamentosMorador
      morador={morador}
      casa={casa}
      cobrancas={cobrancas}
    />
  );
}
