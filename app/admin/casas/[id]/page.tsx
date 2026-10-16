import { buscarCasa, listarCobrancasDaCasa, listarMoradoresDaCasa } from "@/lib/mock-data";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatarData, formatarMoeda } from "@/lib/format";
export default async function casaIdPage({
  params,
}: {  
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const casa = await buscarCasa(Number(id));

  if (!casa) {
    return notFound();
  }

  const moradores = await listarMoradoresDaCasa(Number(id));
  const ocupada = moradores.some((m) => m.ativo);
  const cobrancas = await listarCobrancasDaCasa(Number(id));

  return (
    <div>
        <Link href="/admin/casas">Voltar para a lista de casas</Link>

      <h1>Casa {casa.numero}</h1>
      <p>Quartos: {casa.quartos}</p>
      <p>Valor do Aluguel: R$ {casa.valorAluguel.toFixed(2)}</p>
      <p>Dia de Vencimento: {casa.diaVencimento}</p>
      <p>Ocupada: {ocupada ? "Sim" : "Não"}</p>

      <h1>Moradores</h1>
      {moradores.length === 0 ? (
        <p>Não há moradores cadastrados para esta casa.</p>
      ) : (
        <ul>
          {moradores.map((morador) => (
            <li key={morador.id}>
              <p>Nome: {morador.nome}</p>
              <p>Email: {morador.email}</p>
              <p>Ativo: {morador.ativo ? "Sim" : "Não"}</p>
              <p>Data de entrada: {formatarData(new Date(morador.dataEntrada))}</p>
              <p>Data de saída: {morador.dataSaida ? formatarData(new Date(morador.dataSaida)) : "-"}</p>
            </li>
          ))}
        </ul>
      )}

    <h1>Cobrancas</h1>
    {cobrancas.length === 0 ? (
      <p>Não há cobranças cadastradas para esta casa.</p>
    ) : (
      <ul>
        {cobrancas.map((cobranca) => (
          <li key={cobranca.id}>
            <p>Descrição: {cobranca.competencia}</p>
            <p>Valor: {formatarMoeda(cobranca.valor)}</p>
            <p>Data de Vencimento: {formatarData(new Date(cobranca.vencimento))}</p>
            <p>Status: {cobranca.status}</p>
            <p>Data de Pagamento: {cobranca.pagoEm ? formatarData(new Date(cobranca.pagoEm)) : "-"}</p>
            <p>Forma de Pagamento: {cobranca.formaPagamento || "-"}</p>
          </li>
        ))}
      </ul>
    )}
    </div>
  );
}
