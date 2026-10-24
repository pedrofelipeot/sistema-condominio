import { AppError } from "@/errors/AppError";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function tratarErro(error: unknown) {
   unstable_rethrow(error);
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        erro: "Dados inválidos.",
        detalhes: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json({ erro: error.message }, { status: error.status });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Registro não encontrado." },
        { status: 404 },
      );
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { erro: "Não é possível excluir: existem registros vinculados." },
        { status: 409 },
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { erro: "Já existe um registro com esses dados." },
        { status: 409 },
      );
    }
  }

  console.error(error);
  return NextResponse.json({ erro: "Erro no servidor" }, { status: 500 });
}
