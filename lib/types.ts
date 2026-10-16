export type StatusCobranca = "PENDENTE" | "PAGA";
export type FormaPagamento = "PIX" | "DINHEIRO";

export type Casa = {
  id: number;
  numero: number;
  quartos: number;
  valorAluguel: number;
  diaVencimento: number;
};

export type Cobranca = {
  id: number;
  casaId: number;
  competencia: string; // "2026-10"
  valor: number;
  vencimento: Date;
  status: StatusCobranca;
  pagoEm: Date | null;
  formaPagamento: FormaPagamento | null;
};

export type Aviso = {
  id: number;
  titulo: string;
  texto: string;
  createdAt: Date;
};

export type Morador = {
  id: number;
  nome: string;
  email: string;
  casaId: number;
  ativo: boolean;
  dataEntrada: Date;
  dataSaida: Date | null;
};