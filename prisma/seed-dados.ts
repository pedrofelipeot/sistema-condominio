import { fimDoDiaUTC } from "../lib/date";

/* ------------------------------------------------------------------ */
/* DADOS DE TESTE: nunca use em produção                               */
/* Este arquivo só descreve os dados e calcula as cobranças.           */
/* Quem grava no banco é o prisma/seed.ts                              */
/* ------------------------------------------------------------------ */

export type StatusSeed = "PAGA" | "PENDENTE";
export type FormaSeed = "PIX" | "DINHEIRO";

// [numero, quartos, valorAtual, diaVencimento]
export const CASAS: [number, number, number, number][] = [
  [1, 1, 400, 5], [2, 1, 400, 5], [3, 1, 400, 5], [4, 1, 400, 5],
  [5, 1, 400, 10], [6, 1, 400, 10], [7, 1, 400, 10], [8, 1, 450, 10],
  [9, 1, 450, 15], [10, 1, 450, 15],
  [11, 2, 600, 5], [12, 2, 600, 5], [13, 2, 600, 10], [14, 2, 600, 10],
  [15, 2, 650, 15], [16, 2, 650, 15], [17, 2, 650, 25],
  [18, 3, 800, 25], [19, 3, 800, 25], [20, 3, 850, 25],
];

// Reajustes: antes da competência indicada, as cobranças usam o valor anterior.
// Mostra que a cobrança guarda uma CÓPIA do valor da casa na época em que foi gerada.
// numero da casa -> [competência do reajuste, valor anterior]
export const REAJUSTES: Record<number, [string, number]> = {
  1: ["2026-01", 350],
  2: ["2026-01", 350],
  11: ["2026-01", 550],
  12: ["2026-01", 550],
  15: ["2026-01", 600],
};

// Cobranças que continuam em aberto, por casa (todas já vencidas, exceto onde o vencimento é futuro)
export const EM_ABERTO: Record<number, string[]> = {
  3: ["2026-03", "2026-04"], // Fernanda saiu devendo dois meses
  5: ["2026-08", "2026-09", "2026-10"], // Camila: três meses atrasados
  7: ["2026-02", "2026-03"], // Tiago saiu devendo dois meses
  8: ["2026-08", "2026-09", "2026-10"], // Roberto: inadimplente recorrente
  12: ["2026-10"], // Bruno: só o mês atual
  13: ["2026-10"],
  15: ["2026-09", "2026-10"], // Leandro
  18: ["2026-09"], // setembro atrasado; outubro ainda vai vencer (dia 25)
};

// [casa, entrada, saída]. Saída nula = ainda mora.
// O usuário fica ATIVO se tiver algum período aberto.
export type Periodo = [casa: number, entrada: string, saida: string | null];

export type MoradorSeed = {
  nome: string;
  // Sem senha definida: precisa do link de convite para entrar
  convite?: "pendente" | "expirado";
  periodos: Periodo[];
};

export const MORADORES: MoradorSeed[] = [
  // Casa 1: família com dois moradores
  { nome: "Maria Silva", periodos: [[1, "2025-03-01", null]] },
  { nome: "João Silva", periodos: [[1, "2025-03-01", null]] },

  // Casa 2: morador antigo saiu e outro entrou (com dias sem ninguém no meio)
  { nome: "Carlos Lima", periodos: [[2, "2024-06-01", "2026-01-31"]] },
  { nome: "Ana Souza", periodos: [[2, "2026-02-10", null]] },

  // Casa 3: ex-moradora saiu devendo; morador novo não deve ver nada dela
  { nome: "Fernanda Rocha", periodos: [[3, "2025-01-10", "2026-04-20"]] },
  { nome: "Paulo Santos", periodos: [[3, "2026-05-01", null]] },

  // Casa 4: vazia agora; o último morador pagou tudo
  { nome: "Ricardo Mendes", periodos: [[4, "2024-08-01", "2026-08-31"]] },

  // Casa 5: Bruno saiu e foi para a casa 12; Camila nunca definiu a senha (convite expirado)
  { nome: "Bruno Tavares", periodos: [[5, "2025-02-01", "2025-11-30"], [12, "2025-12-15", null]] },
  { nome: "Camila Dias", convite: "expirado", periodos: [[5, "2026-01-05", null]] },

  // Casa 6: três moradores
  { nome: "Eduardo Pinto", periodos: [[6, "2025-06-01", null]] },
  { nome: "Larissa Pinto", periodos: [[6, "2025-06-01", null]] },
  { nome: "Sônia Pinto", periodos: [[6, "2025-06-01", null]] },

  // Casa 7: vazia agora; saiu devendo
  { nome: "Tiago Ramos", periodos: [[7, "2025-09-15", "2026-03-10"]] },

  // Casa 8: inadimplente recorrente
  { nome: "Roberto Alves", periodos: [[8, "2024-11-01", null]] },

  // Casa 9: morou, saiu e voltou para a mesma casa
  { nome: "Helena Prado", periodos: [[9, "2024-10-01", "2025-06-30"], [9, "2026-03-01", null]] },

  // Casa 10: sempre em dia
  { nome: "Gustavo Neves", periodos: [[10, "2025-04-01", null]] },

  // Casa 11: dois moradores, sempre em dia
  { nome: "Rita Alves", periodos: [[11, "2024-11-15", null]] },
  { nome: "Marcos Alves", periodos: [[11, "2025-01-10", null]] },

  // Casa 12: Luiz saiu e Bruno entrou (troca dentro do mesmo mês)
  { nome: "Luiz Costa", periodos: [[12, "2025-08-01", "2025-12-10"]] },

  // Casa 13: dois moradores desde 2025 e um terceiro que chegou depois
  { nome: "Patrícia Gomes", periodos: [[13, "2025-05-01", null]] },
  { nome: "Diego Gomes", periodos: [[13, "2025-05-01", null]] },
  { nome: "Valéria Gomes", periodos: [[13, "2026-02-01", null]] },

  // Casa 14: troca com quinze dias sem morador (a cobrança de julho não existe)
  { nome: "Henrique Maia", periodos: [[14, "2025-10-01", "2026-06-30"]] },
  { nome: "Isabela Torres", periodos: [[14, "2026-07-15", null]] },

  // Casa 15: inadimplente recente
  { nome: "Leandro Freitas", periodos: [[15, "2025-01-20", null]] },

  // Casa 16: morador recente
  { nome: "Otávio Ribeiro", periodos: [[16, "2026-06-10", null]] },

  // Casa 17: dois moradores (vencimento dia 25)
  { nome: "Simone Cardoso", periodos: [[17, "2025-03-01", null]] },
  { nome: "Felipe Cardoso", periodos: [[17, "2025-03-01", null]] },

  // Casa 18: três moradores, casa de 3 quartos
  { nome: "Alexandre Teles", periodos: [[18, "2025-12-01", null]] },
  { nome: "Débora Teles", periodos: [[18, "2025-12-01", null]] },
  { nome: "Yasmin Teles", periodos: [[18, "2025-12-01", null]] },

  // Casa 19: nunca teve morador.
  // Casa 20: morador recém-cadastrado, ainda com convite pendente
  { nome: "Gabriel Moura", convite: "pendente", periodos: [[20, "2026-09-01", null]] },
];

export function emailDe(nome: string) {
  const primeiro = nome.split(" ")[0];
  return (
    primeiro
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase() + "@exemplo.com"
  );
}

export function estaAtivo(m: MoradorSeed) {
  return m.periodos.some(([, , saida]) => saida === null);
}

/* ------------------------------------------------------------------ */
/* Cobranças: calculadas a partir das ocupações                        */
/* Regra do seed: só existe cobrança se a casa tinha morador na data   */
/* de vencimento. (O CobrancaService.gerarCobrancas atual cobra TODAS  */
/* as casas, ocupadas ou não: é uma decisão de negócio em aberto.)     */
/* ------------------------------------------------------------------ */

export type CobrancaSeed = {
  casaNumero: number;
  competencia: string;
  valor: number;
  vencimento: Date;
  status: StatusSeed;
  pagoEm: Date | null;
  formaPagamento: FormaSeed | null;
};

// Hash simples e determinístico: mesma entrada, mesmo resultado em toda execução
function hash(texto: string) {
  let x = 2166136261;
  for (const ch of texto) {
    x ^= ch.charCodeAt(0);
    x = Math.imul(x, 16777619);
  }
  return x >>> 0;
}

function somarDias(data: Date, dias: number) {
  return new Date(data.getTime() + dias * 86_400_000);
}

// Dias de diferença entre o vencimento e o pagamento: negativo = adiantado, positivo = atrasado
const DIAS_ATE_PAGAR = [-3, -1, 0, 0, 0, 0, 0, 0, 1, 3, 9, 16];

export function inicioDeHoje(agora = new Date()) {
  return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
}

export function gerarCobrancas(hoje: Date): CobrancaSeed[] {
  // períodos de ocupação por casa, no mesmo formato gravado no banco (saída = fim do dia)
  const ocupacoes = new Map<number, { entrada: Date; saida: Date | null }[]>();
  for (const m of MORADORES) {
    for (const [casa, entrada, saida] of m.periodos) {
      const lista = ocupacoes.get(casa) ?? [];
      lista.push({
        entrada: new Date(entrada),
        saida: saida ? fimDoDiaUTC(new Date(saida)) : null,
      });
      ocupacoes.set(casa, lista);
    }
  }

  const resultado: CobrancaSeed[] = [];
  const anoFim = hoje.getUTCFullYear();
  const mesFim = hoje.getUTCMonth() + 1;
  let ano = 2025;
  let mes = 1;

  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    const competencia = `${ano}-${String(mes).padStart(2, "0")}`;

    for (const [numero, , valorAtual, dia] of CASAS) {
      const vencimento = new Date(Date.UTC(ano, mes - 1, dia));

      const ocupada = (ocupacoes.get(numero) ?? []).some(
        (o) => o.entrada <= vencimento && (o.saida === null || o.saida >= vencimento),
      );
      if (!ocupada) continue;

      const reajuste = REAJUSTES[numero];
      const valor = reajuste && competencia < reajuste[0] ? reajuste[1] : valorAtual;

      const semente = hash(`${numero}-${competencia}`);
      let status: StatusSeed = "PAGA";
      let pagoEm: Date | null = null;

      if (EM_ABERTO[numero]?.includes(competencia)) {
        status = "PENDENTE";
      } else if (vencimento > hoje) {
        // ainda não venceu: parte já pagou adiantado, o resto está pendente (mas em dia)
        if ((semente >>> 3) % 4 === 0) {
          pagoEm = somarDias(hoje, -(1 + ((semente >>> 5) % 4)));
        } else {
          status = "PENDENTE";
        }
      } else {
        const candidata = somarDias(vencimento, DIAS_ATE_PAGAR[semente % DIAS_ATE_PAGAR.length]);
        pagoEm = candidata > hoje ? hoje : candidata; // nunca paga no futuro
      }

      resultado.push({
        casaNumero: numero,
        competencia,
        valor,
        vencimento,
        status,
        pagoEm,
        formaPagamento: status === "PAGA" ? (semente % 3 === 0 ? "DINHEIRO" : "PIX") : null,
      });
    }

    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }

  return resultado;
}

/* ------------------------------------------------------------------ */
/* Avisos                                                              */
/* ------------------------------------------------------------------ */

export function gerarAvisos(hoje: Date) {
  const diasAtras = (n: number) => somarDias(hoje, -n);

  return [
    { titulo: "Portão", texto: "Por favor, não batam o portão ao entrar ou sair, principalmente à noite.", createdAt: diasAtras(13) },
    { titulo: "Limpeza da área comum", texto: "A limpeza será no sábado pela manhã. Evitem deixar objetos no corredor.", createdAt: diasAtras(18) },
    { titulo: "Vencimento do aluguel", texto: "O aluguel vence na data indicada em cada cobrança. Pagamentos por Pix ou em dinheiro com a administração.", createdAt: diasAtras(31) },
    { titulo: "Manutenção da caixa d'água", texto: "Na próxima terça-feira o abastecimento será interrompido das 9h às 13h para manutenção.", createdAt: diasAtras(5) },
    { titulo: "Coleta de lixo", texto: "Os dias de coleta são segunda, quarta e sexta. Coloquem o lixo na calçada somente após as 18h.", createdAt: diasAtras(40) },
    { titulo: "Barulho após as 22h", texto: "Lembramos que o silêncio é obrigatório após as 22h. Contamos com a colaboração de todos.", createdAt: diasAtras(55) },
    { titulo: "Reunião de moradores", texto: "Teremos reunião no próximo mês para tratar de melhorias na iluminação e no portão.\n\nA presença de todos é importante.", createdAt: diasAtras(2) },
    { titulo: "Vagas e estacionamento", texto: "Cada casa tem direito a uma vaga. Visitantes devem estacionar na rua.", createdAt: diasAtras(90) },
  ];
}
