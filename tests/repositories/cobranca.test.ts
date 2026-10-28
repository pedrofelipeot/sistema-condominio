import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { resetDb } from "@/tests/helpers/db";
import { criarCasa, criarCobranca } from "@/tests/helpers/factories";

describe("unicidade de cobrança", () => {
  beforeEach(resetDb);
  afterAll(async () => prisma.$disconnect());
  it("não permite duplicar casa e competência", async () => {
    const casa = await criarCasa(); await criarCobranca(casa.id, { competencia: "2026-03" });
    await expect(criarCobranca(casa.id, { competencia: "2026-03" })).rejects.toMatchObject({ code: "P2002" });
  });
});
