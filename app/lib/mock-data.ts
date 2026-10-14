import type { Aviso, Casa, Cobranca, Morador } from "./types";

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

// Casas 1, 2, 3, 11 e 12 ocupadas; as demais estão vagas.
// Casa 1 tem 2 moradores; casa 2 tem um morador ativo e um que já saiu.
const moradores: Morador[] = [
  { id: 1, nome: "Maria Silva", email: "maria@exemplo.com", casaId: 1, ativo: true, dataEntrada: new Date("2025-03-01"), dataSaida: null },
  { id: 2, nome: "João Silva", email: "joao@exemplo.com", casaId: 1, ativo: true, dataEntrada: new Date("2025-03-01"), dataSaida: null },
  { id: 3, nome: "Ana Souza", email: "ana@exemplo.com", casaId: 2, ativo: true, dataEntrada: new Date("2026-02-10"), dataSaida: null },
  { id: 4, nome: "Carlos Lima", email: "carlos@exemplo.com", casaId: 2, ativo: false, dataEntrada: new Date("2024-06-01"), dataSaida: new Date("2026-01-31") },
  { id: 5, nome: "Paulo Santos", email: "paulo@exemplo.com", casaId: 3, ativo: true, dataEntrada: new Date("2026-05-01"), dataSaida: null },
  { id: 6, nome: "Rita Alves", email: "rita@exemplo.com", casaId: 11, ativo: true, dataEntrada: new Date("2024-11-15"), dataSaida: null },
  { id: 7, nome: "Luiz Costa", email: "luiz@exemplo.com", casaId: 12, ativo: true, dataEntrada: new Date("2025-08-01"), dataSaida: null },
];

const cobrancas: Cobranca[] = [
  // Casa 1: histórico com a cobrança de outubro ainda pendente (e já vencida)
  { id: 1, casaId: 1, competencia: "2026-07", valor: 400, vencimento: new Date("2026-07-05"), status: "PAGA", pagoEm: new Date("2026-07-04"), formaPagamento: "PIX" },
  { id: 2, casaId: 1, competencia: "2026-08", valor: 400, vencimento: new Date("2026-08-05"), status: "PAGA", pagoEm: new Date("2026-08-06"), formaPagamento: "DINHEIRO" },
  { id: 3, casaId: 1, competencia: "2026-09", valor: 400, vencimento: new Date("2026-09-05"), status: "PAGA", pagoEm: new Date("2026-09-05"), formaPagamento: "PIX" },
  { id: 4, casaId: 1, competencia: "2026-10", valor: 400, vencimento: new Date("2026-10-05"), status: "PENDENTE", pagoEm: null, formaPagamento: null },
  // Casa 11: serve para testar que cada casa só vê as próprias cobranças
  { id: 5, casaId: 11, competencia: "2026-09", valor: 600, vencimento: new Date("2026-09-05"), status: "PAGA", pagoEm: new Date("2026-09-03"), formaPagamento: "PIX" },
  { id: 6, casaId: 11, competencia: "2026-10", valor: 600, vencimento: new Date("2026-10-05"), status: "PAGA", pagoEm: new Date("2026-10-02"), formaPagamento: "PIX" },
  // Outubro das demais casas ocupadas: uma paga e duas pendentes (em atraso)
  { id: 7, casaId: 2, competencia: "2026-10", valor: 400, vencimento: new Date("2026-10-05"), status: "PAGA", pagoEm: new Date("2026-10-05"), formaPagamento: "DINHEIRO" },
  { id: 8, casaId: 3, competencia: "2026-10", valor: 400, vencimento: new Date("2026-10-05"), status: "PENDENTE", pagoEm: null, formaPagamento: null },
  { id: 9, casaId: 12, competencia: "2026-10", valor: 600, vencimento: new Date("2026-10-05"), status: "PENDENTE", pagoEm: null, formaPagamento: null },
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

export async function listarMoradoresDaCasa(casaId: number): Promise<Morador[]> {
  return moradores
    .filter((m) => m.casaId === casaId)
    .sort((a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome)); // ativos primeiro
}

export async function listarCobrancasDaCasa(casaId: number): Promise<Cobranca[]> {
  return cobrancas
    .filter((c) => c.casaId === casaId)
    .sort((a, b) => b.competencia.localeCompare(a.competencia)); // mais recente primeiro
}

export async function listarCobrancasDoMes(competencia: string): Promise<Cobranca[]> {
  return cobrancas
    .filter((c) => c.competencia === competencia)
    .sort((a, b) => a.casaId - b.casaId);
}

export async function listarAvisos(): Promise<Aviso[]> {
  return [...avisos].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function buscarAviso(id: number): Promise<Aviso | undefined> {
  return avisos.find((a) => a.id === id);
}

export async function listarTodasCobrancas(): Promise<Cobranca[]> {
  return cobrancas;
}