export function formatarData(data: Date | null): string {
  return data ? data.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—";
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}