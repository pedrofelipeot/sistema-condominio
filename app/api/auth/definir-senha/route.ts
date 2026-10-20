import { NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";
import { definirSenhaSchema } from "@/validators/schemas";
import { tratarErro } from "@/lib/api-erro";

export async function POST(req: Request) {
  try {
    const dados = definirSenhaSchema.parse(await req.json());
    await AuthService.definirSenha(dados);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return tratarErro(error);
  }
}