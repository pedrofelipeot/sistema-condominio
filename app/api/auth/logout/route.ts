import { NextResponse } from "next/server";
import { encerrarSessao } from "@/lib/sessao";
import { tratarErro } from "@/lib/api-erro";

export async function POST() {
  try {
    await encerrarSessao();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return tratarErro(error);
  }
}