import { listarCasas } from "@/app/lib/mock-data";
import Link from "next/link";

export default async function CasasPage() {
    const casas = await listarCasas();
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Casas</h1>
            <ul className="flex flex-col gap-2">
                {casas.map((casa) => (
                    <li key={casa.id} className="border rounded p-2">
                        <p><strong>Casa {casa.numero}</strong></p>
                        <p>Quartos: {casa.quartos}</p>
                        <p>Valor do Aluguel: R$ {casa.valorAluguel.toFixed(2)}</p>
                        <p>Dia de Vencimento: {casa.diaVencimento}</p>
                        <Link href={`/admin/casas/${casa.id}`} className="text-blue-500 hover:underline">
                            Ver Detalhes
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}