import { NextResponse } from "next/server";
import { OcupacaoService } from "@/services/OcupacaoService";
import { obterSessao } from "@/lib/sessao";
import { tratarErro } from "@/lib/api-erro";

export async function GET() {
  try {
    const solicitante = await obterSessao();
    const dados = await OcupacaoService.minhaOcupacao(solicitante);
    return NextResponse.json(dados);
  } catch (error) {
    return tratarErro(error);
  }
}