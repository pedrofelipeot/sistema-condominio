import { tratarErro } from "@/lib/api-erro";
import { obterSessao } from "@/lib/sessao";
import { OcupacaoService } from "@/services/OcupacaoService";
import { idParamSchema, registrarSaidaSchema } from "@/validators/schemas";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const solicitante = await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const { dataSaida } = registrarSaidaSchema.parse(await req.json());
    const ocupacao = await OcupacaoService.encerrarMoradia(
      id,
      dataSaida,
      solicitante,
    );

    return NextResponse.json(ocupacao);
  } catch (error) {
    return tratarErro(error);
  }
}
