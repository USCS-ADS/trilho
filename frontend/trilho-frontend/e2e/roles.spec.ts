import { expect, test } from "@playwright/test";
import { DEMO_ADMIN_EMAIL, login } from "./helpers";

/**
 * A interface esconde o que cada perfil não pode fazer (a API recusa de qualquer forma — veja
 * `RolePermissionMatrixTests` no backend). Dados do modo demonstração:
 *   - Ana Luiza: líder do time Backend; Raphael lidera Frontend; Vitor Medina é membro (Backend e Machine Learning).
 *   - task-119 é do time Backend; task-125 é do time Frontend.
 */
const LEADER_EMAIL = "ana.luiza@exemplo.com";
const MEMBER_EMAIL = "vitor.medina@exemplo.com";

const manageButtons = (page: import("@playwright/test").Page) =>
    page.getByRole("button", { name: /^Gerenciar o time / });

const button = (page: import("@playwright/test").Page, name: string) =>
    page.getByRole("button", { name, exact: true });

test.describe("membro", () => {
    test.beforeEach(async ({ page }) => {
        await login(page, MEMBER_EMAIL);
    });

    test("Configurações: sem convidar, sem criar usuário, sem trocar perfil e só vê a si mesmo", async ({ page }) => {
        await page.goto("/configuracoes");

        await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
        await expect(button(page, "Convidar usuário")).toHaveCount(0);
        await expect(button(page, "Criar usuário")).toHaveCount(0);
        await expect(page.locator('select[aria-label^="Perfil de"]')).toHaveCount(0);
        await expect(page.locator("tbody tr")).toHaveCount(1);
        await expect(page.getByText("Meu perfil")).toBeVisible();
    });

    test("Times: sem criar e sem gerenciar", async ({ page }) => {
        await page.goto("/times");

        await expect(button(page, "Novo time")).toHaveCount(0);
        await expect(manageButtons(page)).toHaveCount(0);
    });

    test("Detalhe da tarefa: pode editar, não pode excluir", async ({ page }) => {
        await page.goto("/kanban/task-119");

        await expect(button(page, "Editar")).toBeVisible();
        await expect(button(page, "Excluir")).toHaveCount(0);
    });

    test("Integrações Git: sem conectar repositório", async ({ page }) => {
        await page.goto("/integracoes-git");

        await expect(page.getByRole("heading", { name: "Integrações Git" })).toBeVisible();
        await expect(button(page, "Conectar repositório")).toHaveCount(0);
    });

    test("Priorização: sem aplicar sugestões", async ({ page }) => {
        await page.goto("/tarefas");

        await expect(page.locator("h1")).toHaveCount(1);
        await expect(button(page, "Aplicar sugestões")).toHaveCount(0);
    });
});

test.describe("líder (Ana Luiza, time Backend)", () => {
    test.beforeEach(async ({ page }) => {
        await login(page, LEADER_EMAIL);
    });

    test("Configurações: convida, mas não cria usuário nem troca perfil", async ({ page }) => {
        await page.goto("/configuracoes");

        await expect(button(page, "Convidar usuário")).toBeVisible();
        await expect(button(page, "Criar usuário")).toHaveCount(0);
        await expect(page.locator('select[aria-label^="Perfil de"]')).toHaveCount(0);
    });

    test("Convite: líder só oferece o perfil Membro", async ({ page }) => {
        await page.goto("/configuracoes");
        await button(page, "Convidar usuário").click();

        const roles = page.getByRole("dialog").getByLabel("Perfil de acesso");
        await expect(roles.locator("option")).toHaveText(["Membro"]);
    });

    test("Times: gerencia só o próprio time e não cria time", async ({ page }) => {
        await page.goto("/times");

        await expect(button(page, "Novo time")).toHaveCount(0);
        await expect(manageButtons(page)).toHaveCount(1);
    });

    test("Detalhe: exclui tarefa do time que lidera, mas não a de outro time", async ({ page }) => {
        await page.goto("/kanban/task-119");
        await expect(button(page, "Excluir")).toBeVisible();

        await page.goto("/kanban/task-125");
        await expect(button(page, "Excluir")).toHaveCount(0);
    });

    test("Integrações Git: pode conectar repositório", async ({ page }) => {
        await page.goto("/integracoes-git");

        await expect(button(page, "Conectar repositório")).toBeVisible();
    });
});

test.describe("administrador", () => {
    test.beforeEach(async ({ page }) => {
        await login(page, DEMO_ADMIN_EMAIL);
    });

    test("Times: cria e gerencia todos os times", async ({ page }) => {
        await page.goto("/times");

        await expect(button(page, "Novo time")).toBeVisible();
        await expect(manageButtons(page)).toHaveCount(4);
    });

    test("Configurações: convida e troca perfil de qualquer usuário", async ({ page }) => {
        await page.goto("/configuracoes");

        await expect(button(page, "Convidar usuário")).toBeVisible();
        await expect(page.locator('select[aria-label^="Perfil de"]').first()).toBeVisible();
    });

    test("Convite: administrador oferece todos os perfis", async ({ page }) => {
        await page.goto("/configuracoes");
        await button(page, "Convidar usuário").click();

        const roles = page.getByRole("dialog").getByLabel("Perfil de acesso");
        await expect(roles.locator("option")).toHaveCount(3);
    });

    test("Detalhe: exclui tarefa de qualquer time", async ({ page }) => {
        await page.goto("/kanban/task-125");

        await expect(button(page, "Excluir")).toBeVisible();
    });
});
