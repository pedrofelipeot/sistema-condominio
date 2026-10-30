import { assertTestDatabaseIsIsolated } from "./helpers/guard-test-database";
assertTestDatabaseIsIsolated();
if (process.env.ALLOW_DB_RESET !== "true") {
  throw new Error("Testes só rodam com o .env.test (ALLOW_DB_RESET=true). Abortando para proteger o banco real.");
}
