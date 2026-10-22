import { NextResponse } from "next/server";
import { tratarErro } from "@/lib/api-erro";
import { CobrancaService } from "@/services/CobrancaService";
import { gerarCobrancasSchema } from "@/validators/schemas";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error("A variável de ambiente CRON_SECRET não está configurada.");
    return NextResponse.json(
      { erro: "O cron não está configurado corretamente." },
      { status: 500 },
    );
  }

  if (request.headers.get("authorization") !== "Bearer " + secret) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  try {
    const competencia = new Date().toISOString().slice(0, 7);
    const dados = gerarCobrancasSchema.parse({ competencia });
    const cobrancas = await CobrancaService.gerarCobrancasAgendadas(dados);

    return NextResponse.json({
      competencia,
      total: cobrancas.length,
    });
  } catch (error) {
    return tratarErro(error);
  }
}
