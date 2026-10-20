import { NextResponse } from "next/server";
import { OcupacaoService } from "@/services/OcupacaoService";
import { obterSessao } from "@/lib/sessao";
import { novoMoradorSchema } from "@/validators/schemas";
import { tratarErro } from "@/lib/api-erro";

export async function POST(req: Request) {
  try {
    const solicitante = await obterSessao();
    const dados = novoMoradorSchema.parse(await req.json());
    const resultado = await OcupacaoService.cadastrarMorador(dados, solicitante);
    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    return tratarErro(error);
  }
}