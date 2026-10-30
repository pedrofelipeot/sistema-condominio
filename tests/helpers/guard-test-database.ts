import { readFileSync, existsSync } from "node:fs";
import { parseEnv } from "node:util";

export function assertTestDatabaseIsIsolated(): void {
  if (process.env.CI === "true") return;
  if (!existsSync(".env.test")) {
    throw new Error("Tests require .env.test to verify the test database host.");
  }
  if (!existsSync(".env")) return;

  const testDatabaseUrl = parseEnv(readFileSync(".env.test", "utf8")).DATABASE_URL;
  const localDatabaseUrl = parseEnv(readFileSync(".env", "utf8")).DATABASE_URL;
  if (!testDatabaseUrl || !localDatabaseUrl) return;

  let testHost: string;
  let localHost: string;
  try {
    testHost = new URL(testDatabaseUrl).hostname.toLowerCase();
    localHost = new URL(localDatabaseUrl).hostname.toLowerCase();
  } catch {
    throw new Error("Could not verify database host isolation between .env.test and .env.");
  }

  if (testHost === localHost) {
    throw new Error("Tests blocked: DATABASE_URL host in .env.test matches the host in .env.");
  }
}
