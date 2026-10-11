import {listarAvisos} from "@/app/lib/mock-data";

export default async function avisosPage() {
const avisos = await listarAvisos();
  return (
    <div>
      <h1>Avisos</h1>
      <p>Lista de avisos do condomínio.</p>
      {avisos.map((aviso) => (
        <div key={aviso.id}>
          <h2>{aviso.titulo}</h2>
          <p>{aviso.texto}</p>
        </div>
      ))}
    </div>
  );
}
