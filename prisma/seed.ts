import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { fimDoDiaUTC } from "../lib/date";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Defina DATABASE_URL no arquivo .env");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// AJUSTE com os dados reais: [numero, quartos, valorAluguel, diaVencimento]
// Os valores abaixo são apenas exemplos (iguais aos do mock).
const CASAS: [number, number, number, number][] = [
  [1, 1, 400, 5], [2, 1, 400, 5], [3, 1, 400, 5], [4, 1, 400, 5], [5, 1, 400, 5],
  [6, 1, 400, 5], [7, 1, 400, 5], [8, 1, 400, 5], [9, 1, 400, 5], [10, 1, 400, 5],
  [11, 2, 600, 5], [12, 2, 600, 5], [13, 2, 600, 5], [14, 2, 600, 5], [15, 2, 600, 5],
  [16, 2, 600, 5], [17, 2, 600, 5], [18, 2, 600, 5], [19, 2, 600, 5], [20, 2, 600, 5],
];

// DADOS DE TESTE (mesmos do mock): remova quando for usar o sistema de verdade
// [nome, email, numeroDaCasa, ativo, dataEntrada, dataSaida]
const MORADORES_TESTE: [string, string, number, boolean, string, string | null][] = [
  ["Maria Silva", "maria@exemplo.com", 1, true, "2025-03-01", null],
  ["João Silva", "joao@exemplo.com", 1, true, "2025-03-01", null],
  ["Ana Souza", "ana@exemplo.com", 2, true, "2026-02-10", null],
  ["Carlos Lima", "carlos@exemplo.com", 2, false, "2024-06-01", "2026-01-31"],
  ["Paulo Santos", "paulo@exemplo.com", 3, true, "2026-05-01", null],
  ["Rita Alves", "rita@exemplo.com", 11, true, "2024-11-15", null],
  ["Luiz Costa", "luiz@exemplo.com", 12, true, "2025-08-01", null],
];

// [numeroDaCasa, competencia, valor, vencimento, status, pagoEm, formaPagamento]
const COBRANCAS_TESTE: [number, string, number, string, "PAGA" | "PENDENTE", string | null, "PIX" | "DINHEIRO" | null][] = [
  [1, "2026-07", 400, "2026-07-05", "PAGA", "2026-07-04", "PIX"],
  [1, "2026-08", 400, "2026-08-05", "PAGA", "2026-08-06", "DINHEIRO"],
  [1, "2026-09", 400, "2026-09-05", "PAGA", "2026-09-05", "PIX"],
  [1, "2026-10", 400, "2026-10-05", "PENDENTE", null, null],
  [11, "2026-09", 600, "2026-09-05", "PAGA", "2026-09-03", "PIX"],
  [11, "2026-10", 600, "2026-10-05", "PAGA", "2026-10-02", "PIX"],
  [2, "2026-10", 400, "2026-10-05", "PAGA", "2026-10-05", "DINHEIRO"],
  [3, "2026-10", 400, "2026-10-05", "PENDENTE", null, null],
  [12, "2026-10", 600, "2026-10-05", "PENDENTE", null, null],
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const moradorPassword = process.env.SEED_MORADOR_PASSWORD;
  if (!adminEmail || !adminPassword || !moradorPassword) {
    throw new Error("Defina ADMIN_EMAIL, ADMIN_PASSWORD e SEED_MORADOR_PASSWORD no .env");
  }

  // 1. Casas (upsert: pode rodar várias vezes sem duplicar)
  const casaIdPorNumero = new Map<number, number>();
  for (const [numero, quartos, valorAluguel, diaVencimento] of CASAS) {
    const casa = await prisma.casa.upsert({
      where: { numero },
      update: {}, // não sobrescreve ajustes feitos depois pelo sistema
      create: { numero, quartos, valorAluguel, diaVencimento },
    });
    casaIdPorNumero.set(numero, casa.id);
  }
  console.log(`${CASAS.length} casas garantidas.`);

  // 2. Admin (a senha vem do .env, nunca fica escrita no código)
  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: "Administradora",
      email: adminEmail,
      senhaHash: await bcrypt.hash(adminPassword, 10),
      perfil: "ADMIN",
    },
  });
  console.log(`Admin garantido: ${adminEmail}`);

  // 3. Moradores de teste
  const senhaHashMoradores = await bcrypt.hash(moradorPassword, 10);
  for (const [nome, email, numeroCasa, ativo, entrada, saida] of MORADORES_TESTE) {
    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: {
        nome,
        email,
        senhaHash: senhaHashMoradores,
        perfil: "MORADOR",
        ativo,
        precisaTrocarSenha: true,
      },
    });

    const casaId = casaIdPorNumero.get(numeroCasa)!;
    const dataEntrada = new Date(entrada);
    await prisma.ocupacao.upsert({
      where: {
        usuarioId_casaId_dataEntrada: {
          usuarioId: usuario.id,
          casaId,
          dataEntrada,
        },
      },
      update: { dataSaida: saida ? fimDoDiaUTC(new Date(saida)) : null },
      create: {
        usuarioId: usuario.id,
        casaId,
        dataEntrada,
        dataSaida: saida ? fimDoDiaUTC(new Date(saida)) : null,
      },
    });
  }
  console.log(`${MORADORES_TESTE.length} moradores de teste garantidos.`);

  // 4. Cobranças de teste (a regra única casa + mês impede duplicar)
  for (const [numeroCasa, competencia, valor, vencimento, status, pagoEm, forma] of COBRANCAS_TESTE) {
    const casaId = casaIdPorNumero.get(numeroCasa)!;
    await prisma.cobranca.upsert({
      where: { casaId_competencia: { casaId, competencia } },
      update: {},
      create: {
        casaId,
        competencia,
        valor,
        vencimento: new Date(vencimento),
        status,
        pagoEm: pagoEm ? new Date(pagoEm) : null,
        formaPagamento: forma,
      },
    });
  }
  console.log(`${COBRANCAS_TESTE.length} cobranças de teste garantidas.`);

  // 5. Avisos de teste (só cria se a tabela estiver vazia, para não duplicar)
  if ((await prisma.aviso.count()) === 0) {
    await prisma.aviso.createMany({
      data: [
        { titulo: "Portão", texto: "Por favor, não batam o portão ao entrar ou sair, principalmente à noite.", autorId: admin.id, createdAt: new Date("2026-10-08") },
        { titulo: "Limpeza da área comum", texto: "A limpeza será no sábado pela manhã. Evitem deixar objetos no corredor.", autorId: admin.id, createdAt: new Date("2026-10-03") },
        { titulo: "Vencimento do aluguel", texto: "O aluguel vence todo dia 5. Pagamentos por Pix ou em dinheiro com a administração.", autorId: admin.id, createdAt: new Date("2026-09-20") },
      ],
    });
    console.log("3 avisos de teste criados.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
