import { readFileSync, existsSync } from "node:fs";
import { parse } from "dotenv";

export function assertTestDatabaseIsIsolated(): void {
  if (process.env.CI === "true") return;
  if (!existsSync(".env.test") || !existsSync(".env")) return;

  const testDatabaseUrl = parse(readFileSync(".env.test")).DATABASE_URL;
  const localDatabaseUrl = parse(readFileSync(".env")).DATABASE_URL;
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