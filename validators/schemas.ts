import { z } from "zod";

// Mensagens padrão do Zod em português (vale para tudo que não tiver mensagem própria)
z.config(z.locales.pt());

/* ------------------------------------------------------------------ */
/* Campos reutilizáveis: a regra e a mensagem ficam juntas, em um só   */
/* lugar, e os schemas abaixo apenas os combinam                       */
/* ------------------------------------------------------------------ */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Informe um e-mail válido." }));

const nome = z
  .string()
  .trim()
  .min(2, "Informe o nome.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");

// bcrypt considera no máximo 72 bytes, não 72 caracteres Unicode.
const senhaNova = z
  .string({ error: "Informe a senha." })
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.")
  .refine((senha) => new TextEncoder().encode(senha).length <= 72, {
    error: "A senha deve ter no máximo 72 bytes.",
  });

// Aceita números do JSON e strings numéricas de parâmetros/inputs, mas não booleanos.
const id = z
  .union([
    z.number(),
    z.string().trim().regex(/^\d+$/, "Identificador inválido.").transform(Number),
  ], { error: "Identificador inválido." })
  .pipe(
    z
      .number()
      .int("Identificador inválido.")
      .min(1, "Identificador inválido.")
      .max(2_147_483_647, "Identificador inválido."),
  );

const dataIso = z
  .string({ error: "Informe uma data válida." })
  .trim()
  .regex(
    /^(?!0000)\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/,
    "Informe uma data válida.",
  )
  .refine((valor) => {
    const dia = valor.slice(0, 10);
    const dataCalendario = new Date(`${dia}T00:00:00.000Z`);
    return (
      !Number.isNaN(Date.parse(valor)) &&
      dataCalendario.toISOString().slice(0, 10) === dia
    );
  }, "Informe uma data válida.");

const data = z
  .union([z.date(), dataIso], { error: "Informe uma data válida." })
  .transform((valor) => (valor instanceof Date ? valor : new Date(valor)));

// Formato "2026-10", o mesmo usado em Cobranca.competencia
const competencia = z
  .string({ error: "Informe o mês." })
  .regex(/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido. Use o formato AAAA-MM.");

/* ------------------------------------------------------------------ */
/* Autenticação e contas                                               */
/* ------------------------------------------------------------------ */

export const loginSchema = z.object({
  email,
  // No login só exigimos que não esteja vazia (as regras de tamanho valem ao criar a senha)
  senha: z.string({ error: "Informe a senha." }).min(1, "Informe a senha."),
});

export const trocarSenhaSchema = z
  .object({
    senhaAtual: z.string({ error: "Informe a senha atual." }).min(1, "Informe a senha atual."),
    novaSenha: senhaNova,
    confirmarSenha: z.string({ error: "Confirme a nova senha." }),
  })
  .refine((dados) => dados.novaSenha === dados.confirmarSenha, {
    error: "As senhas não conferem.",
    path: ["confirmarSenha"], // o erro aparece no campo de confirmação
  });

// Admin redefine a senha de um morador
export const redefinirSenhaSchema = z.object({ novaSenha: senhaNova });

export const novoAdminSchema = z.object({ nome, email, senha: senhaNova });

export const atualizarUsuarioSchema = z
  .object({ nome, email })
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    error: "Informe ao menos um campo para atualizar.",
  });

/* ------------------------------------------------------------------ */
/* Casas e moradores                                                   */
/* ------------------------------------------------------------------ */

export const casaSchema = z.object({
  numero: z.coerce
    .number({ error: "Informe o número da casa." })
    .int("O número da casa deve ser um número inteiro.")
    .min(1, "Número da casa inválido.")
    .max(9999, "Número da casa inválido."),
  quartos: z.coerce
    .number({ error: "Informe a quantidade de quartos." })
    .int("A quantidade de quartos deve ser um número inteiro.")
    .min(1, "A casa deve ter pelo menos 1 quarto.")
    .max(10, "Quantidade de quartos inválida."),
  valorAluguel: z
    .union([
      z.number().refine(
        (valor) => /^\d+(?:\.\d{1,2})?$/.test(valor.toString()),
        "Use no máximo duas casas decimais.",
      ),
      z
        .string()
        .trim()
        .regex(/^\d+(?:\.\d{1,2})?$/, "Use no máximo duas casas decimais.")
        .transform(Number),
    ], { error: "Informe o valor do aluguel." })
    .pipe(
      z
        .number()
        .positive("O valor do aluguel deve ser maior que zero.")
        .max(1_000_000, "Valor do aluguel muito alto."),
    ),
  // Até o dia 28 para o vencimento existir em todos os meses (inclusive fevereiro)
  diaVencimento: z.coerce
    .number({ error: "Informe o dia do vencimento." })
    .int("O dia deve ser um número inteiro.")
    .min(1, "Use um dia entre 1 e 28.")
    .max(28, "Use um dia entre 1 e 28."),
});

export const atualizarCasaSchema = casaSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    error: "Informe ao menos um campo para atualizar.",
  });

export const novoMoradorSchema = z.object({
  nome,
  email,
  senha: senhaNova, // senha provisória
  casaId: id,
  dataEntrada: data,
});

export const registrarSaidaSchema = z.object({ dataSaida: data });

/* ------------------------------------------------------------------ */
/* Cobranças e pagamentos                                              */
/* ------------------------------------------------------------------ */

export const gerarCobrancasSchema = z.object({ competencia });

export const pagamentoSchema = z.object({
  pagoEm: data,
  formaPagamento: z.enum(["PIX", "DINHEIRO"], { error: "Escolha Pix ou dinheiro." }),
});

/* ------------------------------------------------------------------ */
/* Avisos                                                              */
/* ------------------------------------------------------------------ */

export const avisoSchema = z.object({
  titulo: z
    .string({ error: "Informe o título." })
    .trim()
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(100, "O título deve ter no máximo 100 caracteres."),
  texto: z
    .string({ error: "Informe o texto do aviso." })
    .trim()
    .min(3, "O texto deve ter pelo menos 3 caracteres.")
    .max(2000, "O texto deve ter no máximo 2000 caracteres."),
});

export const atualizarAvisoSchema = avisoSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    error: "Informe ao menos um campo para atualizar.",
  });

/* ------------------------------------------------------------------ */
/* Parâmetros de URL e filtros de listagem (tudo opcional)             */
/* ------------------------------------------------------------------ */

export const idParamSchema = z.object({ id });
export const mesQuerySchema = z.object({ mes: competencia });

export const filtrarCobrancasSchema = z.object({
  mes: competencia.optional(),
  status: z.enum(["PENDENTE", "PAGA"]).optional(),
  casaId: id.optional(),
});

// Morador não escolhe casa: a visibilidade dele vem das ocupações
export const filtrarCobrancasMoradorSchema = filtrarCobrancasSchema.omit({
  casaId: true,
});

export const filtrarMoradoresSchema = z.object({
  busca: z.string().trim().min(1).optional(),
  ativo: z.stringbool().optional(),
});

export const filtrarAvisosSchema = z.object({
  busca: z.string().trim().min(1).optional(),
});

/* ------------------------------------------------------------------ */
/* Tipos TypeScript gerados a partir dos schemas                       */
/* ------------------------------------------------------------------ */

export type LoginInput = z.infer<typeof loginSchema>;
export type TrocarSenhaInput = z.infer<typeof trocarSenhaSchema>;
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;
export type NovoAdminInput = z.infer<typeof novoAdminSchema>;
export type AtualizarUsuarioInput = z.infer<typeof atualizarUsuarioSchema>;
export type CasaInput = z.infer<typeof casaSchema>;
export type AtualizarCasaInput = z.infer<typeof atualizarCasaSchema>;
export type NovoMoradorInput = z.infer<typeof novoMoradorSchema>;
export type RegistrarSaidaInput = z.infer<typeof registrarSaidaSchema>;
export type GerarCobrancasInput = z.infer<typeof gerarCobrancasSchema>;
export type PagamentoInput = z.infer<typeof pagamentoSchema>;
export type AvisoInput = z.infer<typeof avisoSchema>;
export type AtualizarAvisoInput = z.infer<typeof atualizarAvisoSchema>;
export type FiltrarCobrancasInput = z.infer<typeof filtrarCobrancasSchema>;
export type FiltrarCobrancasMoradorInput = z.infer<typeof filtrarCobrancasMoradorSchema>;
export type FiltrarMoradoresInput = z.infer<typeof filtrarMoradoresSchema>;
export type FiltrarAvisosInput = z.infer<typeof filtrarAvisosSchema>;