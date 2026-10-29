import { prisma } from "../../lib/prisma";

export async function resetDb() {
  if (process.env.ALLOW_DB_RESET !== "true") {
    throw new Error("resetDb só pode rodar com o .env.test");
  }

  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  if (tables.length === 0) return;

  const list = tables.map((t) => `"public"."${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`
  );
}