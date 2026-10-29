import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";

const SENHA = "SenhaE2e123!";
const BASE_URL = "http://localhost:3100";
let dados: Record<string, string | number>;

function seed(cenario: string) {
  const saida = execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "e2e/seed.ts", cenario], {
    encoding: "utf8",
    env: process.env,
  });
  return JSON.parse(saida) as Record<string, string | number>;
}

async function entrarPelaTela(page: Page, email: string, senha = SENHA) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("textbox", { name: "Senha" }).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function entrarPelaApi(page: Page, email: string) {
  const resposta = await page.request.post(`${BASE_URL}/api/auth/login`, {
    data: { email, senha: SENHA },
  });
  expect(resposta.status()).toBe(200);
}

test.beforeEach(async ({}, testInfo) => {
  const cenarios: Record<string, string> = {
    "login direciona o administrador para /admin": "login-admin",
    "login direciona o morador para /morador": "login-morador",
    "login com senha errada mostra uma mensagem de erro": "senha-errada",
    "morador que abre /admin é redirecionado para /morador": "morador-admin",
    "convite cadastra morador, define senha e permite entrar": "convite",
    "morador vê somente cobranças da sua casa dentro do período de ocupação": "visibilidade",
    "pagamento registrado pelo admin aparece como pago para o morador": "pagamento",
  };
  const cenario = cenarios[testInfo.title];
  if (!cenario) throw new Error(`Falta um cenário de seed para: ${testInfo.title}`);
  dados = seed(cenario);
});

test("login direciona o administrador para /admin", async ({ page }) => {
  await entrarPelaTela(page, String(dados.adminEmail));
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("login direciona o morador para /morador", async ({ page }) => {
  await entrarPelaTela(page, String(dados.moradorEmail));
  await expect(page).toHaveURL(/\/morador$/);
  await expect(page.getByRole("heading", { name: "Olá, Morador teste" })).toBeVisible();
});

test("login com senha errada mostra uma mensagem de erro", async ({ page }) => {
  await entrarPelaTela(page, String(dados.adminEmail), "SenhaErrada123!");
  await expect(page.getByRole("alert").filter({ hasText: /inv/ })).toContainText(/E-mail ou senha inv/);
});

test("morador que abre /admin é redirecionado para /morador", async ({ page }) => {
  await entrarPelaTela(page, String(dados.moradorEmail));
  await expect(page).toHaveURL(/\/morador$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/morador$/);
});

test("convite cadastra morador, define senha e permite entrar", async ({ page }) => {
  await entrarPelaTela(page, String(dados.adminEmail));
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/casas/${dados.casaId}/cadastro-morador`);
  await page.getByLabel("Nome").fill("Morador do convite");
  await page.getByLabel("E-mail").fill("convidado@e2e.local");
  await page.getByLabel("Data de entrada").fill("2026-03-10");
  await page.getByRole("button", { name: "Cadastrar morador" }).click();
  await expect(page.getByRole("heading", { name: "Morador cadastrado" })).toBeVisible();

  const link = await page.getByLabel("Link de convite").inputValue();
  const convite = new URL(link);
  await page.goto(`${convite.pathname}${convite.search}`);
  await page.getByRole("textbox", { name: "Nova senha", exact: true }).fill(SENHA);
  await page.getByRole("textbox", { name: "Confirme a nova senha" }).fill(SENHA);
  await page.getByRole("button", { name: "Definir senha" }).click();
  await expect(page.getByRole("heading", { name: "Senha definida" })).toBeVisible();
  await page.getByRole("link", { name: "Ir para o acesso" }).click();
  await page.getByLabel("E-mail").fill("convidado@e2e.local");
  await page.getByRole("textbox", { name: "Senha" }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/morador$/);
});

test("morador vê somente cobranças da sua casa dentro do período de ocupação", async ({ page }) => {
  await entrarPelaApi(page, String(dados.moradorEmail));
  await page.goto("/morador/pagamentos");
  await expect(page.getByRole("heading", { name: "Pagamentos", exact: true })).toBeVisible();
  const linhas = page.getByRole("table").locator("tbody tr");
  await expect(linhas).toHaveCount(1);
  await expect(linhas).toContainText("março de 2026");
  await expect(linhas).not.toContainText("fevereiro de 2026");
  await expect(linhas).not.toContainText("abril de 2026");
});

test("pagamento registrado pelo admin aparece como pago para o morador", async ({ page }) => {
  await entrarPelaApi(page, String(dados.adminEmail));
  await page.goto(`/admin/casas/${dados.casaId}`);
  await expect(page.getByRole("button", { name: "Registrar Pagamento" })).toBeVisible();
  await page.getByRole("button", { name: "Registrar Pagamento" }).click();
  await page.getByLabel("Data do pagamento").fill("2026-03-15");
  const respostaPagamento = page.waitForResponse((resposta) => resposta.url().includes("/api/cobrancas/") && resposta.request().method() === "PATCH");
  await page.getByRole("button", { name: "Confirmar pagamento" }).click();
  const response = await respostaPagamento;
  expect(response.status(), await response.text()).toBe(200);
  const linhaAdmin = page.getByRole("row").filter({ hasText: "março de 2026" });
  await expect(linhaAdmin).toContainText("Paga");

  await entrarPelaApi(page, String(dados.moradorEmail));
  await page.goto("/morador/pagamentos");
  const linhaMorador = page.getByRole("row").filter({ hasText: "março de 2026" });
  await expect(linhaMorador).toContainText("Paga");
});