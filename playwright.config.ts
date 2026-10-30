import { config as loadEnv } from "dotenv";
import { assertTestDatabaseIsIsolated } from "./tests/helpers/guard-test-database";
import { defineConfig } from "@playwright/test";

const isCI = process.env.CI === "true";
if (!isCI) loadEnv({ path: ".env.test", override: true });
assertTestDatabaseIsIsolated();
if (process.env.ALLOW_DB_RESET !== "true" || !process.env.DATABASE_URL) {
  throw new Error("Playwright exige .env.test com ALLOW_DB_RESET=true e DATABASE_URL definido.");
}
const databaseHost = new URL(process.env.DATABASE_URL).hostname.toLowerCase();
if (isCI ? databaseHost !== "localhost" : !databaseHost.endsWith(".neon.tech")) {
  throw new Error(isCI ? "No CI, Playwright só pode usar o PostgreSQL local do service container." : "Playwright só pode executar contra o banco Neon definido em .env.test.");
}
const baseURL = "http://localhost:3100";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "html",
  expect: { timeout: 30000 },
  use: { baseURL, browserName: "chromium", trace: "on-first-retry" },
  webServer: {
    command: isCI ? "npm start -- -p 3100" : "dotenv -e .env.test -- next dev -p 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      ALLOW_DB_RESET: "true",
      SESSION_SECRET: process.env.SESSION_SECRET ?? "fake-e2e-session-secret-only",
      CRON_SECRET: process.env.CRON_SECRET ?? "fake-e2e-cron-secret-only",
      APP_URL: baseURL,
      PIX_CHAVE: process.env.PIX_CHAVE ?? "e2e-chave-pix@example.test",
      PIX_NOME_RECEBEDOR: process.env.PIX_NOME_RECEBEDOR ?? "Condominio E2E",
      PIX_CIDADE: process.env.PIX_CIDADE ?? "Sao Paulo",
    },
  },
});
