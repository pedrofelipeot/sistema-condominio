import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { defineConfig } from "prisma/config";

if (existsSync(".env")) {
  for (const [key, value] of Object.entries(parseEnv(readFileSync(".env", "utf8")))) {
    process.env[key] ??= value;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
