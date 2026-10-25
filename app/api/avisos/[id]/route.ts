import { tratarErro } from "@/lib/api-erro";
import { obterSessao } from "@/lib/sessao";
import { AvisoService } from "@/services/AvisoService";
import { atualizarAvisoSchema, idParamSchema } from "@/validators/schemas";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const aviso = await AvisoService.buscarPorId(id);
    return NextResponse.json(aviso);
  } catch (error) {
    return tratarErro(error);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const solicitante = await obterSessao();
    const { id } = idParamSchema.parse(await params);
    const dado = atualizarAvisoSchema.parse(await req.json());
    const aviso = await AvisoService.editarAviso(id, dado, solicitante);

    return NextResponse.json(aviso);
  } catch (error) {
    return tratarErro(error);
  }
}

export async function DELETE(_req: Request, {params}: Ctx){
    try{
        const solicitante = await obterSessao();
        const { id } = idParamSchema.parse(await params);
        await AvisoService.excluirAviso(id, solicitante);

        return new NextResponse(null,{status:204})
    }catch(error){
        return tratarErro(error)
    }
}
