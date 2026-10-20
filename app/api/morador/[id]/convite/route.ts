import { NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";
import { obterSessao } from "@/lib/sessao";
import { idParamSchema } from "@/validators/schemas";
import { tratarErro } from "@/lib/api-erro";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const solicitante = await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const resultado = await AuthService.reenviarConvite(id, solicitante);
    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    return tratarErro(error);
  }
}