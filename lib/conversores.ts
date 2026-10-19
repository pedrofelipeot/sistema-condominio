import type { Casa, Cobranca, Morador } from "@/lib/types";

export type CasaApi = {
  id: number;
  numero: number;
  quartos: number;
  valorAluguel: string;
  diaVencimento: number;
};

export type CobrancaApi = {
  id: number;
  casaId: number;
  competencia: string;
  valor: string;
  vencimento: string;
  status: "PENDENTE" | "PAGA";
  pagoEm: string | null;
  formaPagamento: "PIX" | "DINHEIRO" | null;
};

export function converterCasa(c: CasaApi): Casa {
  return {
    id: c.id,
    numero: c.numero,
    quartos: c.quartos,
    valorAluguel: Number(c.valorAluguel),
    diaVencimento: c.diaVencimento,
  };
}

export function converterCobranca(c: CobrancaApi): Cobranca {
  return {
    id: c.id,
    casaId: c.casaId,
    competencia: c.competencia,
    valor: Number(c.valor),
    vencimento: new Date(c.vencimento),
    status: c.status,
    pagoEm: c.pagoEm ? new Date(c.pagoEm) : null,
    formaPagamento: c.formaPagamento,
  };
}

export type CasaComMoradoresApi = CasaApi & {
  moradores: { id: number; nome: string; email: string; dataEntrada: string }[];
};

export type OcupacaoApi = {
  id: number;
  casaId: number;
  dataEntrada: string;
  dataSaida: string | null;
  usuario: { id: number; nome: string; email: string };
};

export type MoradorDaCasa = {
  id: number; // id da ocupação: o mesmo morador pode ter mais de um período
  nome: string;
  email: string;
  ativo: boolean;
  dataEntrada: Date;
  dataSaida: Date | null;
};

export function converterOcupacao(o: OcupacaoApi): MoradorDaCasa {
  return {
    id: o.id,
    nome: o.usuario.nome,
    email: o.usuario.email,
    ativo: o.dataSaida === null,
    dataEntrada: new Date(o.dataEntrada),
    dataSaida: o.dataSaida ? new Date(o.dataSaida) : null,
  };
}

export type MinhaCasaApi = {
  morador: { id: number; nome: string; email: string };
  casa: CasaApi;
  dataEntrada: string;
};

export function converterMorador(m: MinhaCasaApi): Morador {
  return {
    id: m.morador.id,
    nome: m.morador.nome,
    email: m.morador.email,
    casaId: m.casa.id,
    ativo: true, // quem tem ocupação ativa e conseguiu logar está ativo
    dataEntrada: new Date(m.dataEntrada),
    dataSaida: null,
  };
}