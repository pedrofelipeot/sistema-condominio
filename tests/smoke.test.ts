import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("ambiente de teste", () => {
  it("conecta no banco de teste", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    expect(result).toBeDefined();
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});