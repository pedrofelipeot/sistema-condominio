import { NextResponse } from "next/server";
import { CasaService } from "@/services/CasaService";
import { obterSessao } from "@/lib/sessao";
import { atualizarCasaSchema, idParamSchema } from "@/validators/schemas";
import { tratarErro } from "@/lib/api-erro";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const solicitante = await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const casa = await CasaService.buscarPorId(id, solicitante);
    return NextResponse.json(casa);
  } catch (error) {
    return tratarErro(error);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const solicitante = await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const dados = atualizarCasaSchema.parse(await req.json());
    const casa = await CasaService.editarCasa(id, dados, solicitante);
    return NextResponse.json(casa);
  } catch (error) {
    return tratarErro(error);
  }
}