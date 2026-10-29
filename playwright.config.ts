import { config as loadEnv } from "dotenv";
import { defineConfig } from "@playwright/test";

loadEnv({ path: ".env.test", override: true });

if (process.env.ALLOW_DB_RESET !== "true" || !process.env.DATABASE_URL) {
  throw new Error("Playwright exige .env.test com ALLOW_DB_RESET=true e DATABASE_URL definido.");
}

const databaseHost = new URL(process.env.DATABASE_URL).hostname;
if (!databaseHost.endsWith(".neon.tech")) {
  throw new Error("Playwright só pode executar contra o banco Neon definido em .env.test.");
}

const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "html",
  expect: { timeout: 30000 },
  use: {
    baseURL,
    browserName: "chromium",
    trace: "on-first-retry",
  },
  webServer: {
    command: "dotenv -e .env.test -- next dev -p 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      ALLOW_DB_RESET: "true",
      SESSION_SECRET: "segredo-fixo-exclusivo-para-testes-e2e",
      APP_URL: baseURL,
      PIX_CHAVE: "e2e-chave-pix@example.test",
      PIX_NOME_RECEBEDOR: "Condominio E2E",
      PIX_CIDADE: "Sao Paulo",
    },
  },
});