import { createHash, randomBytes } from "crypto";

const VALIDADE_HORAS = 48;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// O token puro vai só no link; no banco fica apenas o hash.
export function gerarTokenConvite() {
  const token = randomBytes(32).toString("base64url"); // 43 caracteres, 256 bits
  return { token, tokenHash: hashToken(token) };
}

export function expiracaoConvite() {
  return new Date(Date.now() + VALIDADE_HORAS * 60 * 60 * 1000);
}

export function montarLinkConvite(token: string) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return `${base}/definir-senha?token=${token}`;
}