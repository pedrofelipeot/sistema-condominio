import { tratarErro } from "@/lib/api-erro";
import { obterSessao } from "@/lib/sessao";
import { AvisoService } from "@/services/AvisoService";
import { avisoSchema, filtrarAvisosSchema } from "@/validators/schemas";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    const solicitante = await obterSessao(); 

    const params = Object.fromEntries(new URL(req.url).searchParams);
    const filtros = filtrarAvisosSchema.parse(params);

    const avisos = await AvisoService.listarAvisos(filtros, solicitante);
    return NextResponse.json(avisos);
  } catch (error) {
    return tratarErro(error);
  }
}

export async function POST(req: Request) {
  try {
    const solicitante = await obterSessao();
    const dado = avisoSchema.parse(await req.json());
    const aviso = await AvisoService.criarAviso(dado, solicitante);

    return NextResponse.json(aviso, { status: 201 });
  } catch (error) {
    return tratarErro(error);
  }
}
