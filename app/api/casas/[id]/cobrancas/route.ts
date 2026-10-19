import { NextResponse } from "next/server";
import { CobrancaService } from "@/services/CobrancaService";
import { obterSessao } from "@/lib/sessao";
import { idParamSchema } from "@/validators/schemas";
import { tratarErro } from "@/lib/api-erro";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const solicitante = await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const cobrancas = await CobrancaService.listarPorCasa(id, solicitante);
    return NextResponse.json(cobrancas);
  } catch (error) {
    return tratarErro(error);
  }
}
