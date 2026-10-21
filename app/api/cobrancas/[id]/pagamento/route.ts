import { tratarErro } from "@/lib/api-erro";
import { obterSessao } from "@/lib/sessao";
import { CobrancaService } from "@/services/CobrancaService";
import { idParamSchema, pagamentoSchema } from "@/validators/schemas";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const solicitante = await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const dados = pagamentoSchema.parse(await req.json());
    const cobranca = await CobrancaService.registrarPagamento(
      id,
      dados,
      solicitante,
    );

    return NextResponse.json(cobranca);
  } catch (error) {
    return tratarErro(error);
  }
}
