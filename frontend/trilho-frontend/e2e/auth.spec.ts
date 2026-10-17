import { expect, test } from "@playwright/test";
import { DEMO_ADMIN_EMAIL, login } from "./helpers";

test.describe("autenticação", () => {
    test("rotas protegidas mandam para o login", async ({ page }) => {
        await page.goto("/kanban");

        await expect(page).toHaveURL(/\/login/);
    });

    test("e-mail desconhecido mostra o erro e não entra", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("E-mail corporativo").fill("ninguem@exemplo.com");
        await page.getByLabel("Senha", { exact: true }).fill("Trilho@2026");
        await page.getByRole("button", { name: "Entrar" }).click();

        await expect(page.locator("form").getByRole("alert")).toContainText(/inválid/i);
        await expect(page).toHaveURL(/\/login/);
    });

    test("login válido abre o dashboard e mantém a sessão ao navegar", async ({ page }) => {
        await login(page, DEMO_ADMIN_EMAIL);

        await page.goto("/times");

        await expect(page).toHaveURL(/\/times/);
    });

    test("sessão expirada leva ao login com o aviso", async ({ page }) => {
        await page.goto("/session-expired");

        await expect(page).toHaveURL(/\/login\?expired=1/);
        await expect(page.getByRole("status")).toContainText(/sessão expirou/i);
    });
});
