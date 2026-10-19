import { NextResponse } from "next/server";
import { CasaService } from "@/services/CasaService";
import { obterSessao } from "@/lib/sessao";
import { tratarErro } from "@/lib/api-erro";

export async function GET() {
  try {
    const solicitante = await obterSessao();
    const casas = await CasaService.listarComMoradores(solicitante);
    return NextResponse.json(casas);
  } catch (error) {
    return tratarErro(error);
  }
}