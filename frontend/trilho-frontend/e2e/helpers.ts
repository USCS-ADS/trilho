import { expect, type Page } from "@playwright/test";

/** Usuário administrador do modo demonstração (qualquer senha válida entra). */
export const DEMO_ADMIN_EMAIL = "camila.duarte@exemplo.com";

export async function login(page: Page, email = DEMO_ADMIN_EMAIL) {
    await page.goto("/login");
    await page.getByLabel("E-mail corporativo").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill("Trilho@2026");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
}

/** Coluna do quadro pelo título (ex.: "Em Andamento"). */
export function column(page: Page, label: string) {
    return page.locator("div.w-72", { has: page.getByText(label, { exact: true }) });
}
