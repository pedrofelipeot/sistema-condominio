import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { fimDoDiaUTC } from "../lib/date";
import { expiracaoConvite, gerarTokenConvite, montarLinkConvite } from "../lib/convite";
import { hashSenhaInutilizavel } from "../lib/senha";
import {
  CASAS,
  MORADORES,
  emailDe,
  estaAtivo,
  gerarAvisos,
  gerarCobrancas,
  inicioDeHoje,
} from "./seed-dados";

if (process.env.NODE_ENV === "production") {
  throw new Error("Este seed cria dados de teste: não rode em produção.");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Defina DATABASE_URL no arquivo .env");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// SEED_RESET=true apaga moradores, ocupações, cobranças, convites e avisos antes de recriar.
// Sem isso, o seed só acrescenta o que falta e não altera o que já existe.
const RESET = process.env.SEED_RESET === "true";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const moradorPassword = process.env.SEED_MORADOR_PASSWORD;
  if (!adminEmail || !adminPassword || !moradorPassword) {
    throw new Error("Defina ADMIN_EMAIL, ADMIN_PASSWORD e SEED_MORADOR_PASSWORD no .env");
  }

  const hoje = inicioDeHoje();

  // 0. Limpeza (opcional). A ordem respeita as chaves estrangeiras.
  if (RESET) {
    await prisma.convite.deleteMany();
    await prisma.cobranca.deleteMany();
    await prisma.ocupacao.deleteMany();
    await prisma.aviso.deleteMany();
    await prisma.usuario.deleteMany({ where: { perfil: "MORADOR" } });
    console.log("Dados de teste anteriores apagados (SEED_RESET=true).");
  }

  // 1. Casas
  const casaIdPorNumero = new Map<number, number>();
  for (const [numero, quartos, valorAluguel, diaVencimento] of CASAS) {
    const casa = await prisma.casa.upsert({
      where: { numero },
      // com RESET os valores voltam ao do seed; sem RESET preserva ajustes feitos pelo sistema
      update: RESET ? { quartos, valorAluguel, diaVencimento } : {},
      create: { numero, quartos, valorAluguel, diaVencimento },
    });
    casaIdPorNumero.set(numero, casa.id);
  }
  console.log(`${CASAS.length} casas garantidas.`);

  // 2. Admin (a senha vem do .env)
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

  // 3. Moradores e ocupações
  const senhaHashPadrao = await bcrypt.hash(moradorPassword, 10);
  const usuarioIdPorNome = new Map<string, number>();
  let totalOcupacoes = 0;

  for (const m of MORADORES) {
    const ativo = estaAtivo(m);
    const email = emailDe(m.nome);

    // Quem tem convite ainda não escolheu senha: o hash é de um valor que ninguém conhece
    const senhaHash = m.convite ? await hashSenhaInutilizavel() : senhaHashPadrao;

    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: { nome: m.nome, ativo },
      create: {
        nome: m.nome,
        email,
        senhaHash,
        perfil: "MORADOR",
        ativo,
        precisaTrocarSenha: !m.convite, // quem usa convite já escolhe a própria senha
      },
    });
    usuarioIdPorNome.set(m.nome, usuario.id);

    for (const [numeroCasa, entrada, saida] of m.periodos) {
      const casaId = casaIdPorNumero.get(numeroCasa);
      if (!casaId) throw new Error(`Casa ${numeroCasa} não existe no seed.`);

      const dataEntrada = new Date(entrada);
      const dataSaida = saida ? fimDoDiaUTC(new Date(saida)) : null;

      await prisma.ocupacao.upsert({
        where: {
          usuarioId_casaId_dataEntrada: { usuarioId: usuario.id, casaId, dataEntrada },
        },
        update: { dataSaida },
        create: { usuarioId: usuario.id, casaId, dataEntrada, dataSaida },
      });
      totalOcupacoes += 1;
    }
  }
  console.log(`${MORADORES.length} moradores e ${totalOcupacoes} períodos de ocupação garantidos.`);

  // 4. Convites (pendente e expirado)
  const linksPendentes: string[] = [];
  for (const m of MORADORES.filter((x) => x.convite)) {
    const usuarioId = usuarioIdPorNome.get(m.nome)!;

    // recria sempre, para não acumular convites a cada execução
    await prisma.convite.deleteMany({ where: { usuarioId } });

    const { token, tokenHash } = gerarTokenConvite();
    const expiraEm =
      m.convite === "pendente"
        ? expiracaoConvite()
        : new Date(Date.now() - 24 * 60 * 60 * 1000); // venceu ontem

    await prisma.convite.create({ data: { usuarioId, tokenHash, expiraEm } });

    if (m.convite === "pendente") {
      linksPendentes.push(`${m.nome}: ${montarLinkConvite(token)}`);
    }
  }

  // 5. Cobranças (calculadas a partir das ocupações)
  const cobrancas = gerarCobrancas(hoje);
  await prisma.cobranca.createMany({
    data: cobrancas.map((c) => ({
      casaId: casaIdPorNumero.get(c.casaNumero)!,
      competencia: c.competencia,
      valor: c.valor,
      vencimento: c.vencimento,
      status: c.status,
      pagoEm: c.pagoEm,
      formaPagamento: c.formaPagamento,
    })),
    skipDuplicates: true, // casa + competência é único
  });

  const pendentes = cobrancas.filter((c) => c.status === "PENDENTE");
  const atrasadas = pendentes.filter((c) => c.vencimento < hoje);
  console.log(
    `${cobrancas.length} cobranças: ${cobrancas.length - pendentes.length} pagas, ` +
      `${pendentes.length} pendentes (${atrasadas.length} atrasadas).`,
  );

  // 6. Avisos (só cria se a tabela estiver vazia)
  if ((await prisma.aviso.count()) === 0) {
    const avisos = gerarAvisos(hoje);
    await prisma.aviso.createMany({
      data: avisos.map((a) => ({ ...a, autorId: admin.id })),
    });
    console.log(`${avisos.length} avisos criados.`);
  }

  // 7. Resumo para os testes
  if (linksPendentes.length > 0) {
    console.log("\nLinks de convite pendentes (válidos por 48h):");
    for (const link of linksPendentes) console.log(`  ${link}`);
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
