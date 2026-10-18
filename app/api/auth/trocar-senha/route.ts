import { NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";
import { trocarSenhaSchema } from "@/validators/schemas";
import { obterSessao } from "@/lib/sessao";
import { tratarErro } from "@/lib/api-erro";

export async function POST(req: Request) {
  try {
    const solicitante = await obterSessao();
    const dados = trocarSenhaSchema.parse(await req.json());
    await AuthService.trocarSenha(solicitante.id, dados);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return tratarErro(error);
  }
}