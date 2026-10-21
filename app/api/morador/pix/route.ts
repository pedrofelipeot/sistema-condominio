import { tratarErro } from "@/lib/api-erro";
import { normalizarCampoRecebedor } from "@/lib/pix";
import { obterSessao } from "@/lib/sessao";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await obterSessao();

    const chave = process.env.PIX_CHAVE?.trim();
    const nomeRecebedor = process.env.PIX_NOME_RECEBEDOR?.trim();
    const cidade = process.env.PIX_CIDADE?.trim();
    const configuracoes = [chave, nomeRecebedor, cidade];

    if (configuracoes.every((valor) => !valor)) {
      return NextResponse.json(
        { configurado: false },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (!chave || !nomeRecebedor || !cidade) {
      throw new Error(
        "Configure PIX_CHAVE, PIX_NOME_RECEBEDOR e PIX_CIDADE juntos.",
      );
    }
    if (
      new TextEncoder().encode(chave).length > 77 ||
      /[\u0000-\u001f\u007f]/.test(chave)
    ) {
      throw new Error("PIX_CHAVE não tem um formato válido.");
    }

    return NextResponse.json(
      {
        configurado: true,
        chave,
        nomeRecebedor: normalizarCampoRecebedor(nomeRecebedor, 25),
        cidade: normalizarCampoRecebedor(cidade, 15),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return tratarErro(error);
  }
}
