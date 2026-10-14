import { formatarData } from "../lib/format";
import { listarCasas, listarCobrancasDoMes } from "../lib/mock-data";
import { statusDaCobranca } from "../lib/status";

export default async function adminPage() {

  const casas = await listarCasas();
  const cobrancas = await listarCobrancasDoMes("2026-10");

 const linhas = casas.map((casa) => {
  const cobranca = cobrancas.find((c) => c.casaId === casa.id);
  return { casa, cobranca, status: statusDaCobranca(cobranca) };
});
const pagas = linhas.filter((l) => l.status === "Paga").length;
const emAtraso = linhas.filter((l) => l.status === "Em atraso").length;
const pendentes = linhas.filter((l) => l.status === "Pendente").length;
const semCobranca = linhas.filter((l) => l.status === "Sem cobrança").length;



  
  return (
    <div>
      <h1>Painel Administrativo</h1>

<section>
  <p>Pagas: {pagas}</p>
  <p>Em atraso: {emAtraso}</p>
  <p>Pendentes no prazo: {pendentes}</p>
  <p>Sem cobrança: {semCobranca}</p>
</section>
      <table>
  <thead>
    <tr>
      <th>Número da Casa</th>
      <th>Quartos</th>
      <th>Valor do Aluguel</th>
      <th>Vencimento</th>
      <th>Data de pagamento</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {linhas.map((linha) => (
      <tr key={linha.casa.id}>
        <td>{linha.casa.numero}</td>
        <td>{linha.casa.quartos}</td>
        <td>{linha.casa.valorAluguel}</td>
        <td>{linha.cobranca ? formatarData(linha.cobranca.vencimento) : "-"}</td>
        <td>{linha.cobranca ? formatarData(linha.cobranca.pagoEm) : "-"}</td>
        <td>{linha.status}</td>
      </tr>
    ))}
  </tbody>
</table>
    
    </div>
  );
}