import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const CUSTO_HASH = 10;

export function hashSenha(senha: string) {
  return bcrypt.hash(senha, CUSTO_HASH);
}

// Hash de uma senha aleatória que ninguém conhece:
// a conta nasce sem login possível até o morador definir a própria senha.
export function hashSenhaInutilizavel() {
  return bcrypt.hash(randomBytes(32).toString("hex"), CUSTO_HASH);
}