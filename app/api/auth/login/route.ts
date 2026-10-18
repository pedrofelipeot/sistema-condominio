import { NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";
import { loginSchema } from "@/validators/schemas";
import { criarSessao } from "@/lib/sessao";
import { tratarErro } from "@/lib/api-erro";

export async function POST(req: Request) {
  try {
    const dados = loginSchema.parse(await req.json());
    const usuario = await AuthService.login(dados);
    await criarSessao(usuario.id);

    return NextResponse.json(usuario);
  } catch (error) {
    return tratarErro(error);
  }
}