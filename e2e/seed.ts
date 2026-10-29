import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { resetDb } from "../tests/helpers/db";
import { criarAdmin, criarCasa, criarCobranca, criarMorador, criarOcupacao } from "../tests/helpers/factories";

const SENHA = "SenhaE2e123!";
const acao = process.argv[2];

async function main() {
  await resetDb();
  const senhaHash = await bcrypt.hash(SENHA, 10);
  let resultado: Record<string, unknown>;

  switch (acao) {
    case "login-admin": {
      const admin = await criarAdmin({ email: "admin-login@e2e.local", senhaHash });
      resultado = { adminEmail: admin.email };
      break;
    }
    case "login-morador":
    case "morador-admin": {
      const casa = await criarCasa();
      const morador = await criarMorador({ email: `${acao}@e2e.local`, senhaHash });
      await criarOcupacao(morador.id, casa.id, { dataEntrada: new Date("2026-03-10T00:00:00.000Z") });
      resultado = { moradorEmail: morador.email };
      break;
    }
    case "senha-errada": {
      const admin = await criarAdmin({ email: "admin-senha-errada@e2e.local", senhaHash });
      resultado = { adminEmail: admin.email };
      break;
    }
    case "convite": {
      const admin = await criarAdmin({ email: "admin-convite@e2e.local", senhaHash });
      const casa = await criarCasa();
      resultado = { adminEmail: admin.email, casaId: casa.id };
      break;
    }
    case "visibilidade": {
      const casaDoMorador = await criarCasa({ numero: 11 });
      const outraCasa = await criarCasa({ numero: 12 });
      const morador = await criarMorador({ email: "morador-visibilidade@e2e.local", senhaHash });
      await criarOcupacao(morador.id, casaDoMorador.id, { dataEntrada: new Date("2026-03-10T00:00:00.000Z") });
      await criarCobranca(casaDoMorador.id, { competencia: "2026-02", vencimento: new Date("2026-02-10T00:00:00.000Z") });
      await criarCobranca(casaDoMorador.id, { competencia: "2026-03", vencimento: new Date("2026-03-10T00:00:00.000Z") });
      await criarCobranca(outraCasa.id, { competencia: "2026-04", vencimento: new Date("2026-04-10T00:00:00.000Z") });
      resultado = { moradorEmail: morador.email };
      break;
    }
    case "pagamento": {
      const casa = await criarCasa({ numero: 21 });
      const admin = await criarAdmin({ email: "admin-pagamento@e2e.local", senhaHash });
      const morador = await criarMorador({ email: "morador-pagamento@e2e.local", senhaHash });
      await criarOcupacao(morador.id, casa.id);
      const cobranca = await criarCobranca(casa.id, { competencia: "2026-03", vencimento: new Date("2026-03-10T00:00:00.000Z") });
      resultado = { adminEmail: admin.email, moradorEmail: morador.email, casaId: casa.id, cobrancaId: cobranca.id };
      break;
    }
    default:
      throw new Error(`Cenario E2E desconhecido: ${acao}`);
  }

  process.stdout.write(JSON.stringify(resultado));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});