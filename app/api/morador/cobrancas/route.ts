import { NextResponse } from "next/server";
import { CobrancaService } from "@/services/CobrancaService";
import { obterSessao } from "@/lib/sessao";
import { tratarErro } from "@/lib/api-erro";

export async function GET() {
  try {
    const solicitante = await obterSessao();
    const cobrancas = await CobrancaService.listarDoMorador(solicitante);
    return NextResponse.json(cobrancas);
  } catch (error) {
    return tratarErro(error);
  }
}