import { NextResponse } from "next/server";
import { OcupacaoService } from "@/services/OcupacaoService";
import { obterSessao } from "@/lib/sessao";
import { idParamSchema } from "@/validators/schemas";
import { tratarErro } from "@/lib/api-erro";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const solicitante = await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const ocupacoes = await OcupacaoService.listarPorCasa(id, solicitante);
    return NextResponse.json(ocupacoes);
  } catch (error) {
    return tratarErro(error);
  }
}
