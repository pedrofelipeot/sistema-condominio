import type { Cobranca } from "./types";

// Data de hoje no horário do Brasil, no formato "AAAA-MM-DD"
function hojeEmTexto(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

// O vencimento do mock é guardado à meia-noite UTC, então o dia certo está na parte UTC
function vencimentoEmTexto(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function statusDaCobranca(cobranca: Cobranca | undefined): string {
  if (!cobranca) return "Sem cobrança";
  if (cobranca.status === "PAGA") return "Paga";

  // Textos "AAAA-MM-DD" comparam na ordem certa; só há atraso a partir do dia seguinte
  return vencimentoEmTexto(cobranca.vencimento) < hojeEmTexto() ? "Em atraso" : "Pendente";
}