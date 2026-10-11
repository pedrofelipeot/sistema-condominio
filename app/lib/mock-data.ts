import type { Aviso, Casa, Cobranca } from "./types";

// 20 casas: 1 a 10 com 1 quarto, 11 a 20 com 2 quartos (valores de exemplo)
const casas: Casa[] = Array.from({ length: 20 }, (_, i) => {
  const numero = i + 1;
  const doisQuartos = numero > 10;
  return {
    id: numero,
    numero,
    quartos: doisQuartos ? 2 : 1,
    valorAluguel: doisQuartos ? 600 : 400,
    diaVencimento: 5,
  };
});

const cobrancas: Cobranca[] = [
  // Casa 1: histórico com a cobrança de outubro ainda pendente (e já vencida)
  { id: 1, casaId: 1, competencia: "2026-07", valor: 400, vencimento: new Date("2026-07-05"), status: "PAGA", pagoEm: new Date("2026-07-04"), formaPagamento: "PIX" },
  { id: 2, casaId: 1, competencia: "2026-08", valor: 400, vencimento: new Date("2026-08-05"), status: "PAGA", pagoEm: new Date("2026-08-06"), formaPagamento: "DINHEIRO" },
  { id: 3, casaId: 1, competencia: "2026-09", valor: 400, vencimento: new Date("2026-09-05"), status: "PAGA", pagoEm: new Date("2026-09-05"), formaPagamento: "PIX" },
  { id: 4, casaId: 1, competencia: "2026-10", valor: 400, vencimento: new Date("2026-10-05"), status: "PENDENTE", pagoEm: null, formaPagamento: null },
  // Casa 11: serve para testar que cada casa só vê as próprias cobranças
  { id: 5, casaId: 11, competencia: "2026-09", valor: 600, vencimento: new Date("2026-09-05"), status: "PAGA", pagoEm: new Date("2026-09-03"), formaPagamento: "PIX" },
  { id: 6, casaId: 11, competencia: "2026-10", valor: 600, vencimento: new Date("2026-10-05"), status: "PAGA", pagoEm: new Date("2026-10-02"), formaPagamento: "PIX" },
];

const avisos: Aviso[] = [
  { id: 1, titulo: "Portão", texto: "Por favor, não batam o portão ao entrar ou sair, principalmente à noite.", createdAt: new Date("2026-10-08") },
  { id: 2, titulo: "Limpeza da área comum", texto: "A limpeza será no sábado pela manhã. Evitem deixar objetos no corredor.", createdAt: new Date("2026-10-03") },
  { id: 3, titulo: "Vencimento do aluguel", texto: "O aluguel vence todo dia 5. Pagamentos por Pix ou em dinheiro com a administração.", createdAt: new Date("2026-09-20") },
];

// Funções de acesso: hoje devolvem o mock; depois, trocar o corpo por Prisma
export async function listarCasas(): Promise<Casa[]> {
  return casas;
}

export async function buscarCasa(id: number): Promise<Casa | undefined> {
  return casas.find((c) => c.id === id);
}

export async function listarCobrancasDaCasa(casaId: number): Promise<Cobranca[]> {
  return cobrancas
    .filter((c) => c.casaId === casaId)
    .sort((a, b) => b.competencia.localeCompare(a.competencia)); // mais recente primeiro
}

export async function listarAvisos(): Promise<Aviso[]> {
  return [...avisos].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}